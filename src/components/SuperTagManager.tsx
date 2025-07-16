import React, { useState } from 'react'
import { Plus, Tag, Settings, Trash2, Edit3, Hash } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'
import { SuperTag, TagProperty } from '../types'

interface SuperTagManagerProps {
  superTags: SuperTag[]
  onCreateTag: (tag: Omit<SuperTag, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateTag: (id: string, tag: Partial<SuperTag>) => void
  onDeleteTag: (id: string) => void
}

const colorOptions = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Yellow' },
  { value: '#EF4444', label: 'Red' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#F97316', label: 'Orange' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#84CC16', label: 'Lime' },
]

const iconOptions = [
  { value: 'tag', label: 'Tag', icon: Tag },
  { value: 'hash', label: 'Hash', icon: Hash },
  { value: 'settings', label: 'Settings', icon: Settings },
]

export function SuperTagManager({ superTags, onCreateTag, onUpdateTag, onDeleteTag }: SuperTagManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<SuperTag | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    icon: 'tag',
    description: '',
    properties: [] as TagProperty[]
  })

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#3B82F6',
      icon: 'tag',
      description: '',
      properties: []
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    if (editingTag) {
      onUpdateTag(editingTag.id, formData)
      setEditingTag(null)
    } else {
      onCreateTag(formData)
      setIsCreateOpen(false)
    }
    resetForm()
  }

  const handleEdit = (tag: SuperTag) => {
    setFormData({
      name: tag.name,
      color: tag.color,
      icon: tag.icon || 'tag',
      description: tag.description || '',
      properties: tag.properties
    })
    setEditingTag(tag)
  }

  const addProperty = () => {
    const newProperty: TagProperty = {
      id: Date.now().toString(),
      name: '',
      type: 'text',
      required: false
    }
    setFormData(prev => ({
      ...prev,
      properties: [...prev.properties, newProperty]
    }))
  }

  const updateProperty = (index: number, updates: Partial<TagProperty>) => {
    setFormData(prev => ({
      ...prev,
      properties: prev.properties.map((prop, i) => 
        i === index ? { ...prop, ...updates } : prop
      )
    }))
  }

  const removeProperty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      properties: prev.properties.filter((_, i) => i !== index)
    }))
  }

  const TagForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Tag Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter tag name..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="color">Color</Label>
          <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {colorOptions.map(color => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: color.value }}
                    />
                    {color.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="icon">Icon</Label>
          <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {iconOptions.map(icon => {
                const IconComponent = icon.icon
                return (
                  <SelectItem key={icon.value} value={icon.value}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      {icon.label}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe what this tag represents..."
          rows={3}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Custom Properties</Label>
          <Button type="button" variant="outline" size="sm" onClick={addProperty}>
            <Plus className="w-4 h-4 mr-1" />
            Add Property
          </Button>
        </div>
        
        <div className="space-y-3">
          {formData.properties.map((property, index) => (
            <Card key={property.id} className="p-3">
              <div className="grid grid-cols-3 gap-3">
                <Input
                  placeholder="Property name"
                  value={property.name}
                  onChange={(e) => updateProperty(index, { name: e.target.value })}
                />
                <Select 
                  value={property.type} 
                  onValueChange={(value: any) => updateProperty(index, { type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="multi_select">Multi Select</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removeProperty(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (editingTag) {
              setEditingTag(null)
            } else {
              setIsCreateOpen(false)
            }
            resetForm()
          }}
        >
          Cancel
        </Button>
        <Button type="submit">
          {editingTag ? 'Update Tag' : 'Create Tag'}
        </Button>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Super Tags</h2>
          <p className="text-muted-foreground">Organize your content with powerful, structured tags</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Super Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Super Tag</DialogTitle>
            </DialogHeader>
            <TagForm />
          </DialogContent>
        </Dialog>
      </div>

      {editingTag && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Edit Super Tag</CardTitle>
          </CardHeader>
          <CardContent>
            <TagForm />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {superTags.map(tag => {
          const IconComponent = iconOptions.find(opt => opt.value === tag.icon)?.icon || Tag
          return (
            <Card key={tag.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-lg">{tag.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(tag)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDeleteTag(tag.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tag.description && (
                  <p className="text-sm text-muted-foreground mb-3">{tag.description}</p>
                )}
                
                {tag.properties.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Properties:</p>
                    <div className="flex flex-wrap gap-1">
                      {tag.properties.map(prop => (
                        <Badge key={prop.id} variant="secondary" className="text-xs">
                          {prop.name} ({prop.type})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {superTags.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Super Tags Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first super tag to start organizing your content with structured properties and templates.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Super Tag
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}