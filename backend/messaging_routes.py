from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api")

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['hapployed']
conversations_collection = db['conversations']
messages_collection = db['messages']

# Pydantic models
class MessageCreate(BaseModel):
    conversationId: Optional[str] = None
    senderId: str
    receiverId: str
    content: str
    relatedJobId: Optional[str] = None

class MessageResponse(BaseModel):
    id: str
    conversationId: str
    senderId: str
    receiverId: str
    content: str
    relatedJobId: Optional[str] = None
    isRead: bool
    createdAt: str

class ConversationResponse(BaseModel):
    id: str
    participants: List[str]
    lastMessage: Optional[dict] = None
    unreadCount: int
    createdAt: str
    updatedAt: str

# Helper functions
def serialize_message(msg) -> dict:
    msg['id'] = msg.pop('_id')
    msg['createdAt'] = msg.get('createdAt', datetime.utcnow().isoformat())
    return msg

def serialize_conversation(conv) -> dict:
    conv['id'] = conv.pop('_id')
    conv['createdAt'] = conv.get('createdAt', datetime.utcnow().isoformat())
    conv['updatedAt'] = conv.get('updatedAt', datetime.utcnow().isoformat())
    return conv

# Send message
@router.post("/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(message: MessageCreate):
    """
    Send a new message
    """
    # Find or create conversation
    conversation_id = message.conversationId
    
    if not conversation_id:
        # Check if conversation exists between these users
        existing_conv = await conversations_collection.find_one({
            'participants': {'$all': [message.senderId, message.receiverId]}
        })
        
        if existing_conv:
            conversation_id = existing_conv['_id']
        else:
            # Create new conversation
            conversation_id = str(uuid.uuid4())
            new_conversation = {
                '_id': conversation_id,
                'participants': [message.senderId, message.receiverId],
                'lastMessage': None,
                'unreadCount': 0,
                'createdAt': datetime.utcnow().isoformat(),
                'updatedAt': datetime.utcnow().isoformat()
            }
            await conversations_collection.insert_one(new_conversation)
    
    # Create message
    message_id = str(uuid.uuid4())
    message_dict = {
        '_id': message_id,
        'conversationId': conversation_id,
        'senderId': message.senderId,
        'receiverId': message.receiverId,
        'content': message.content,
        'relatedJobId': message.relatedJobId,
        'isRead': False,
        'createdAt': datetime.utcnow().isoformat()
    }
    
    try:
        await messages_collection.insert_one(message_dict)
        
        # Update conversation with last message
        await conversations_collection.update_one(
            {'_id': conversation_id},
            {
                '$set': {
                    'lastMessage': {
                        'content': message.content,
                        'senderId': message.senderId,
                        'createdAt': datetime.utcnow().isoformat()
                    },
                    'updatedAt': datetime.utcnow().isoformat()
                },
                '$inc': {'unreadCount': 1}
            }
        )
        
        created_message = await messages_collection.find_one({'_id': message_id})
        return serialize_message(created_message)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}"
        )

# Get conversations for user
@router.get("/conversations/{userId}", response_model=List[ConversationResponse])
async def get_user_conversations(userId: str):
    """
    Get all conversations for a user
    """
    try:
        cursor = conversations_collection.find(
            {'participants': userId}
        ).sort('updatedAt', -1)
        
        conversations = await cursor.to_list(length=100)
        return [serialize_conversation(conv) for conv in conversations]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch conversations: {str(e)}"
        )

# Get messages in a conversation
@router.get("/conversations/{conversationId}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(conversationId: str, skip: int = 0, limit: int = 50):
    """
    Get all messages in a conversation
    """
    try:
        cursor = messages_collection.find(
            {'conversationId': conversationId}
        ).sort('createdAt', 1).skip(skip).limit(limit)
        
        messages = await cursor.to_list(length=limit)
        return [serialize_message(msg) for msg in messages]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch messages: {str(e)}"
        )

# Mark messages as read
@router.post("/messages/{conversationId}/mark-read")
async def mark_messages_read(conversationId: str, userId: str):
    """
    Mark all messages in a conversation as read for a user
    """
    try:
        # Update all unread messages where user is receiver
        await messages_collection.update_many(
            {
                'conversationId': conversationId,
                'receiverId': userId,
                'isRead': False
            },
            {'$set': {'isRead': True}}
        )
        
        # Reset unread count in conversation
        await conversations_collection.update_one(
            {'_id': conversationId},
            {'$set': {'unreadCount': 0}}
        )
        
        return {"message": "Messages marked as read"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark messages as read: {str(e)}"
        )

# Get unread count for user
@router.get("/messages/unread/{userId}")
async def get_unread_count(userId: str):
    """
    Get total unread message count for a user
    """
    try:
        count = await messages_collection.count_documents({
            'receiverId': userId,
            'isRead': False
        })
        return {"unreadCount": count}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get unread count: {str(e)}"
        )

# Delete message
@router.delete("/messages/{messageId}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(messageId: str):
    """
    Delete a message
    """
    result = await messages_collection.delete_one({'_id': messageId})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    return None
