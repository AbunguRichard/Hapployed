import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, MapPin, DollarSign, Clock, Calendar, Users,
  Mic, Image as ImageIcon, Plus, X, ChevronDown, AlertCircle,
  Sparkles, Zap, Save, Eye, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardNav from '../components/DashboardNav';

export default function PostProjectPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState('regular'); // 'regular' or 'emergency'
  const [showToGo, setShowToGo] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    customCategory: '',
    amount: '',
    visibility: 'public',
    location: '',
    workModel: 'remote',
    startDate: '',
    endDate: '',
    interviewRequired: false,
    radius: '10',
    timeWindow: 'today',
    duration: '',
    equipment: [],
    customEquipment: '',
  });
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showCustomEquipment, setShowCustomEquipment] = useState(false);

  // AI Budget Suggestion
  useEffect(() => {
    if (formData.description && formData.category) {
      // Mock AI suggestion
      setTimeout(() => {
        setAiSuggestion({
          range: '$120-$160',
          confidence: '85%',
          factors: 'Based on similar posts in your area',
        });
      }, 1000);
    }
  }, [formData.description, formData.category]);

  // Autosave
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title || formData.description) {
        localStorage.setItem('projectDraft', JSON.stringify({ ...formData, mode }));
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [formData, mode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleModeToggle = (newMode) => {
    setMode(newMode);
    // Values persist when switching modes
  };

  const handleToGoPost = () => {
    toast.success('Draft posted in 30 seconds!', {
      description: 'AI is expanding details. Complete your posting for best results.',
      action: {
        label: 'Complete Details',
        onClick: () => setShowToGo(false),
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Use custom category if "Other" is selected
    const finalCategory = formData.category === 'Other' && formData.customCategory 
      ? formData.customCategory 
      : formData.category;
    
    // Add custom equipment if provided
    const finalEquipment = formData.customEquipment
      ? [...formData.equipment, formData.customEquipment]
      : formData.equipment;
    
    toast.success('Project posted successfully!', {
      description: 'We\'re now matching you with qualified candidates.',
    });
    console.log('Posted:', { ...formData, category: finalCategory, equipment: finalEquipment, mode });
  };

  const handlePreview = () => {
    toast.info('Opening preview...');
  };

  const handleSaveDraft = () => {
    localStorage.setItem('projectDraft', JSON.stringify({ ...formData, mode }));
    toast.success('Draft saved!');
  };

  const handleAddCustomEquipment = () => {
    if (formData.customEquipment.trim()) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, prev.customEquipment],
        customEquipment: '',
      }));
      setShowCustomEquipment(false);
      toast.success('Custom equipment added!');
    }
  };

  const categories = [
    'Home Repair', 'IT & Tech', 'Design & Creative', 'Admin & Support',
    'Delivery & Logistics', 'Events', 'Cleaning', 'Pet Care', 'Other'
  ];

  const equipmentOptions = [
    'Car', 'Ladder', 'Tools', 'License Required', 'Background Check',
    'Equipment Provided', 'Own Equipment'
  ];

  return (
    <div className="min-h-screen bg-white">
      <DashboardNav />

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Post a Project</h1>
          <p className="text-muted-foreground">Find the perfect talent for your needs</p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-6">
          <div className="inline-flex rounded-xl bg-muted p-1">
            <button
              onClick={() => handleModeToggle('regular')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                mode === 'regular'
                  ? 'bg-white text-primary shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Regular Project
            </button>
            <button
              onClick={() => handleModeToggle('emergency')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                mode === 'emergency'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Emergency / QuickHire
            </button>
          </div>
          
          {/* Mode Explainer */}
          <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {mode === 'regular' 
              ? 'Scoped work with proposals & milestones.'
              : 'Short, urgent tasks with 1-click apply and radius filter.'
            }
          </p>
        </div>

        {/* To-Go Banner */}
        {!showToGo && (
          <div className="mb-6 p-4 bg-accent/10 border border-accent/30 rounded-xl flex items-center justify-between backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Need to post fast?</p>
                <p className="text-sm text-muted-foreground">Use To-Go mode - post in 30 seconds, AI fills the rest</p>
              </div>
            </div>
            <button 
              onClick={() => setShowToGo(true)}
              className="px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-dark transition-colors"
            >
              Post in 30s
            </button>
          </div>
        )}

        {/* To-Go Mode */}
        {showToGo ? (
          <div className="relative rounded-2xl overflow-hidden">
            {/* Textured Background */}
            <div className="absolute inset-0 bg-gray-100" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
            
            <div className="relative border-2 border-white rounded-2xl p-8 shadow-[0_0_30px_rgba(255,255,255,0.8)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                Quick Post (To-Go)
              </h2>
              <button onClick={() => setShowToGo(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Fix leaking faucet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <div className="relative">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Describe what you need..."
                  />
                  <button className="absolute bottom-3 right-3 p-2 text-muted-foreground hover:text-primary">
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  {formData.category === 'Other' && (
                    <input
                      type="text"
                      name="customCategory"
                      value={formData.customCategory}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mt-2"
                      placeholder="Enter custom category"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Budget</label>
                  <input
                    type="text"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="$0.00"
                  />
                </div>
              </div>

              <button 
                onClick={handleToGoPost}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Post in 30 Seconds
              </button>
              <p className="text-xs text-center text-muted-foreground">
                AI will expand details. You can complete them later.
              </p>
            </div>
            </div>
          </div>
        ) : (
          /* Full Form */
          <div className="relative rounded-2xl overflow-hidden">
            {/* Textured Background */}
            <div className="absolute inset-0 bg-gray-100" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
            
            <form onSubmit={handleSubmit} className="relative border-2 border-white rounded-2xl p-8 shadow-[0_0_30px_rgba(255,255,255,0.8)]">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {mode === 'regular' ? 'Project Title *' : 'Gig Title *'}
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={mode === 'regular' ? 'e.g., Build a React Dashboard' : 'e.g., Emergency Plumbing Repair'}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <div className="relative">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={mode === 'regular' 
                      ? 'Rich description, what you need done, images if helpful...'
                      : 'Short, action-oriented description...'
                    }
                    required
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button type="button" className="p-2 text-muted-foreground hover:text-primary">
                      <Mic className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 text-muted-foreground hover:text-primary">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Category & Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  
                  {/* Custom Category Input */}
                  {formData.category === 'Other' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        name="customCategory"
                        value={formData.customCategory}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter custom category"
                        required
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Amount
                  </label>
                  <input
                    type="text"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="$0.00"
                  />
                  {aiSuggestion && (
                    <div className="mt-2 p-2 bg-accent/10 border border-accent/30 rounded-lg">
                      <p className="text-xs text-foreground flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-accent" />
                        AI suggests: <strong>{aiSuggestion.range}</strong> 
                        <span className="text-muted-foreground">({aiSuggestion.confidence} confidence)</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{aiSuggestion.factors}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Regular Project Fields */}
              {mode === 'regular' && (
                <>
                  {/* Visibility */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Visibility</label>
                    <select
                      name="visibility"
                      value={formData.visibility}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="public">Public</option>
                      <option value="invite">Invite-only</option>
                      <option value="private">Private link</option>
                    </select>
                  </div>

                  {/* Location & Work Model */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Remote or City"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Work Model</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['remote', 'hybrid', 'onsite'].map(model => (
                          <button
                            key={model}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, workModel: model }))}
                            className={`px-3 py-2 rounded-lg border-2 font-medium capitalize transition-all ${
                              formData.workModel === model
                                ? 'border-primary bg-primary text-white'
                                : 'border-border text-foreground hover:border-primary'
                            }`}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Interview Required */}
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <label className="font-medium text-foreground">Interview Required?</label>
                      <p className="text-sm text-muted-foreground">Candidates must complete screening questions</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, interviewRequired: !prev.interviewRequired }))}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        formData.interviewRequired ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        formData.interviewRequired ? 'translate-x-6' : ''
                      }`} />
                    </button>
                  </div>
                </>
              )}

              {/* Emergency Fields */}
              {mode === 'emergency' && (
                <>
                  {/* Radius */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Radius (AI-selected)
                    </label>
                    <select
                      name="radius"
                      value={formData.radius}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {[1, 3, 5, 10, 15, 25, 50].map(r => (
                        <option key={r} value={r}>Within {r} miles</option>
                      ))}
                      <option value="anywhere">Anywhere (remote)</option>
                    </select>
                  </div>

                  {/* Time Window & Duration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Start Within
                      </label>
                      <select
                        name="timeWindow"
                        value={formData.timeWindow}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="2h">2 hours</option>
                        <option value="today">Today</option>
                        <option value="thisweek">This week</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Expected Duration</label>
                      <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., 2-3 hours"
                      />
                    </div>
                  </div>

                  {/* Equipment/License */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Equipment/License Needed</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {equipmentOptions.map(equip => (
                        <button
                          key={equip}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              equipment: prev.equipment.includes(equip)
                                ? prev.equipment.filter(e => e !== equip)
                                : [...prev.equipment, equip]
                            }));
                          }}
                          className={`px-3 py-2 rounded-lg border transition-all ${
                            formData.equipment.includes(equip)
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-foreground hover:border-primary'
                          }`}
                        >
                          {equip}
                        </button>
                      ))}
                      
                      {/* Other Button */}
                      <button
                        type="button"
                        onClick={() => setShowCustomEquipment(!showCustomEquipment)}
                        className={`px-3 py-2 rounded-lg border transition-all flex items-center gap-1 ${
                          showCustomEquipment
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-foreground hover:border-primary'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        Other
                      </button>
                    </div>

                    {/* Custom Equipment Input */}
                    {showCustomEquipment && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="customEquipment"
                          value={formData.customEquipment}
                          onChange={handleChange}
                          className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter custom equipment/license"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomEquipment}
                          className="px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    {/* Display Custom Equipment */}
                    {formData.equipment.filter(e => !equipmentOptions.includes(e)).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <p className="text-sm text-muted-foreground w-full">Custom equipment:</p>
                        {formData.equipment.filter(e => !equipmentOptions.includes(e)).map((equip, idx) => (
                          <span key={idx} className="px-3 py-1 bg-accent/10 text-accent rounded-lg text-sm flex items-center gap-2">
                            {equip}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  equipment: prev.equipment.filter(e => e !== equip)
                                }));
                              }}
                              className="hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  Post Project
                </button>
                <button 
                  type="button"
                  onClick={handlePreview}
                  className="px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Preview
                </button>
                <button 
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-6 py-3 border border-border text-foreground rounded-lg font-semibold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Draft
                </button>
              </div>

              {/* Footer Note */}
              <p className="text-xs text-center text-muted-foreground">
                Verified talent • In-app chat • Pre-funding escrow available
              </p>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}