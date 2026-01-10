import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ITSMLayout } from '@/components/itsm/ITSMLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const incidentSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(200, 'Title is too long'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000, 'Description is too long'),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  category: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
});

const categories = [
  'Hardware',
  'Software',
  'Network',
  'Email',
  'Security',
  'Access/Permissions',
  'Printing',
  'VPN',
  'Database',
  'Other'
];

export default function NewIncident() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    category: '',
    contactEmail: profile?.email || '',
    contactPhone: profile?.phone || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = incidentSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }
    
    setIsSubmitting(true);
    
    // Calculate SLA due time based on severity
    const slaMinutes: Record<string, number> = {
      critical: 120,
      high: 240,
      medium: 480,
      low: 1440,
    };
    
    const slaDueAt = new Date();
    slaDueAt.setMinutes(slaDueAt.getMinutes() + slaMinutes[formData.severity]);
    
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        title: formData.title.trim(),
        description: formData.description.trim(),
        severity: formData.severity as 'critical' | 'high' | 'medium' | 'low',
        status: 'active',
        incident_type: 'alert' as const,
        source: 'ITSM Portal',
        details: {
          category: formData.category || null,
          contact_email: formData.contactEmail || null,
          contact_phone: formData.contactPhone || null,
          reported_by: user?.id,
          sla_due_at: slaDueAt.toISOString(),
        },
      })
      .select()
      .single();
    
    setIsSubmitting(false);
    
    if (error) {
      console.error('Error creating incident:', error);
      toast.error('Failed to create incident');
    } else {
      toast.success('Incident created successfully');
      navigate(`/itsm/incidents/${data.id}`);
    }
  };

  return (
    <ITSMLayout 
      title="New Incident"
      description="Report a new IT incident"
      actions={
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      }
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Create New Incident
          </CardTitle>
          <CardDescription>
            Fill in the details below to report an IT incident
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about the incident..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={5}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="severity">Severity *</Label>
                <Select 
                  value={formData.severity} 
                  onValueChange={(value) => setFormData({ ...formData, severity: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical - Service Down</SelectItem>
                    <SelectItem value="high">High - Major Impact</SelectItem>
                    <SelectItem value="medium">Medium - Moderate Impact</SelectItem>
                    <SelectItem value="low">Low - Minor Issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@org.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254 700 000 000"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Submit Incident'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ITSMLayout>
  );
}
