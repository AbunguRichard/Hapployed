"""
Messaging Routes - Supabase PostgreSQL Version
Real-time messaging system for users
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid

from supabase_client import get_supabase_admin

router = APIRouter(prefix="", tags=["Messaging"])

# ============================================================================
# MODELS
# ============================================================================

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

# ============================================================================
# ROUTES
# ============================================================================

@router.post("/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(message: MessageCreate):
    """Send a new message"""
    try:
        supabase = get_supabase_admin()
        
        conversation_id = message.conversationId
        
        # Find or create conversation
        if not conversation_id:
            # Check if conversation exists between these users
            result = supabase.table('conversations').select('*').contains('participants', [message.senderId, message.receiverId]).execute()
            
            if result.data and len(result.data) > 0:
                # Find exact match (both users in participants)
                for conv in result.data:
                    if set(conv['participants']) == {message.senderId, message.receiverId}:
                        conversation_id = conv['id']
                        break
            
            # Create new conversation if not found
            if not conversation_id:
                conversation_id = str(uuid.uuid4())
                new_conversation = {
                    'id': conversation_id,
                    'participants': [message.senderId, message.receiverId],
                    'last_message_id': None,
                    'unread_count': 0,
                    'created_at': datetime.now(timezone.utc).isoformat(),
                    'updated_at': datetime.now(timezone.utc).isoformat()
                }
                supabase.table('conversations').insert(new_conversation).execute()
        
        # Create message
        message_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()
        
        message_dict = {
            'id': message_id,
            'conversation_id': conversation_id,
            'sender_id': message.senderId,
            'receiver_id': message.receiverId,
            'content': message.content,
            'related_job_id': message.relatedJobId,
            'is_read': False,
            'created_at': timestamp
        }
        
        msg_result = supabase.table('messages').insert(message_dict).execute()
        
        if not msg_result.data or len(msg_result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send message"
            )
        
        # Update conversation
        supabase.table('conversations').update({
            'last_message_id': message_id,
            'updated_at': timestamp
        }).eq('id', conversation_id).execute()
        
        # Increment unread count for receiver
        conv = supabase.table('conversations').select('unread_count').eq('id', conversation_id).execute()
        if conv.data and len(conv.data) > 0:
            current_unread = conv.data[0].get('unread_count', 0)
            supabase.table('conversations').update({
                'unread_count': current_unread + 1
            }).eq('id', conversation_id).execute()
        
        return {
            'id': message_id,
            'conversationId': conversation_id,
            'senderId': message.senderId,
            'receiverId': message.receiverId,
            'content': message.content,
            'relatedJobId': message.relatedJobId,
            'isRead': False,
            'createdAt': timestamp
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}"
        )

@router.get("/conversations/{userId}", response_model=List[ConversationResponse])
async def get_user_conversations(userId: str):
    """Get all conversations for a user"""
    try:
        supabase = get_supabase_admin()
        
        # Get conversations where user is a participant
        result = supabase.table('conversations').select('*').contains('participants', [userId]).order('updated_at', desc=True).execute()
        
        conversations = result.data if result.data else []
        
        # Enrich with last message
        for conv in conversations:
            if conv.get('last_message_id'):
                msg_result = supabase.table('messages').select('*').eq('id', conv['last_message_id']).execute()
                if msg_result.data and len(msg_result.data) > 0:
                    msg = msg_result.data[0]
                    conv['lastMessage'] = {
                        'id': msg['id'],
                        'content': msg['content'],
                        'senderId': msg['sender_id'],
                        'createdAt': msg['created_at']
                    }
                else:
                    conv['lastMessage'] = None
            else:
                conv['lastMessage'] = None
            
            # Format for response
            conv['createdAt'] = conv.pop('created_at')
            conv['updatedAt'] = conv.pop('updated_at')
            conv['unreadCount'] = conv.pop('unread_count', 0)
        
        return conversations
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get conversations: {str(e)}"
        )

@router.get("/conversations/{conversationId}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(conversationId: str, limit: int = 50):
    """Get messages from a conversation"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('messages').select('*').eq('conversation_id', conversationId).order('created_at', desc=True).limit(limit).execute()
        
        messages = result.data if result.data else []
        
        # Format for response
        formatted_messages = []
        for msg in messages:
            formatted_messages.append({
                'id': msg['id'],
                'conversationId': msg['conversation_id'],
                'senderId': msg['sender_id'],
                'receiverId': msg['receiver_id'],
                'content': msg['content'],
                'relatedJobId': msg.get('related_job_id'),
                'isRead': msg.get('is_read', False),
                'createdAt': msg['created_at']
            })
        
        # Reverse to get chronological order
        formatted_messages.reverse()
        
        return formatted_messages
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get messages: {str(e)}"
        )

@router.post("/messages/{conversationId}/mark-read")
async def mark_messages_as_read(conversationId: str, userId: str):
    """Mark all messages in a conversation as read for a user"""
    try:
        supabase = get_supabase_admin()
        
        # Mark all unread messages as read for this user
        supabase.table('messages').update({
            'is_read': True
        }).eq('conversation_id', conversationId).eq('receiver_id', userId).eq('is_read', False).execute()
        
        # Reset unread count
        supabase.table('conversations').update({
            'unread_count': 0
        }).eq('id', conversationId).execute()
        
        return {
            'success': True,
            'message': 'Messages marked as read'
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark messages as read: {str(e)}"
        )

@router.get("/messages/unread/{userId}")
async def get_unread_count(userId: str):
    """Get total unread message count for a user"""
    try:
        supabase = get_supabase_admin()
        
        # Get all conversations for user
        conv_result = supabase.table('conversations').select('unread_count').contains('participants', [userId]).execute()
        
        conversations = conv_result.data if conv_result.data else []
        
        total_unread = sum(conv.get('unread_count', 0) for conv in conversations)
        
        return {
            'userId': userId,
            'unreadCount': total_unread
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get unread count: {str(e)}"
        )

@router.delete("/messages/{messageId}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(messageId: str):
    """Delete a message"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('messages').delete().eq('id', messageId).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete message: {str(e)}"
        )
