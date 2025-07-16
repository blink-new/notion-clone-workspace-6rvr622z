import React, { useState, useRef, useEffect } from 'react'
import { Plus, Type, Hash, List, CheckSquare, Quote, Code, Minus, Image, Tag, X } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command'
import { Page, ContentBlock, SuperTag } from '../types'

interface PageEditorProps {
  page: Page
  superTags: SuperTag[]
  onUpdatePage: (updates: Partial<Page>) => void
}

const blockTypes = [
  { type: 'paragraph', label: 'Text', icon: Type },
  { type: 'heading1', label: 'Heading 1', icon: Hash },
  { type: 'heading2', label: 'Heading 2', icon: Hash },
  { type: 'heading3', label: 'Heading 3', icon: Hash },
  { type: 'bulleted_list', label: 'Bulleted List', icon: List },
  { type: 'numbered_list', label: 'Numbered List', icon: List },
  { type: 'todo', label: 'To-do', icon: CheckSquare },
  { type: 'quote', label: 'Quote', icon: Quote },
  { type: 'code', label: 'Code', icon: Code },
  { type: 'divider', label: 'Divider', icon: Minus },
]

export function PageEditor({ page, superTags, onUpdatePage }: PageEditorProps) {
  const [content, setContent] = useState<ContentBlock[]>(page.content)
  const [title, setTitle] = useState(page.title)
  const [selectedTags, setSelectedTags] = useState<string[]>(page.tags)
  const [properties, setProperties] = useState<Record<string, any>>(page.properties)
  const [isTagsOpen, setIsTagsOpen] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (titleRef.current && !title) {
      titleRef.current.focus()
    }
  }, [title])

  const updateContent = (newContent: ContentBlock[]) => {
    setContent(newContent)
    onUpdatePage({ content: newContent })
  }

  const updateTitle = (newTitle: string) => {
    setTitle(newTitle)
    onUpdatePage({ title: newTitle })
  }

  const updateTags = (newTags: string[]) => {
    setSelectedTags(newTags)
    onUpdatePage({ tags: newTags })
    
    // Update properties based on selected tags
    const newProperties = { ...properties }
    const allTagProperties = superTags
      .filter(tag => newTags.includes(tag.id))
      .flatMap(tag => tag.properties)
    
    // Add default values for new tag properties
    allTagProperties.forEach(prop => {
      if (!(prop.name in newProperties) && prop.defaultValue !== undefined) {
        newProperties[prop.name] = prop.defaultValue
      }
    })
    
    setProperties(newProperties)
    onUpdatePage({ properties: newProperties })
  }

  const updateProperty = (name: string, value: any) => {
    const newProperties = { ...properties, [name]: value }
    setProperties(newProperties)
    onUpdatePage({ properties: newProperties })
  }

  const addBlock = (type: ContentBlock['type'], index?: number) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      properties: {}
    }

    const newContent = [...content]
    if (index !== undefined) {
      newContent.splice(index + 1, 0, newBlock)
    } else {
      newContent.push(newBlock)
    }
    
    updateContent(newContent)
  }

  const updateBlock = (blockId: string, updates: Partial<ContentBlock>) => {
    const newContent = content.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    )
    updateContent(newContent)
  }

  const deleteBlock = (blockId: string) => {
    const newContent = content.filter(block => block.id !== blockId)
    updateContent(newContent)
  }

  const renderBlock = (block: ContentBlock, index: number) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        addBlock('paragraph', index)
      } else if (e.key === 'Backspace' && block.content === '') {
        e.preventDefault()
        deleteBlock(block.id)
      }
    }

    const commonProps = {
      value: block.content,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        updateBlock(block.id, { content: e.target.value }),
      onKeyDown: handleKeyDown,
      placeholder: getPlaceholder(block.type),
      className: getBlockClassName(block.type)
    }

    switch (block.type) {
      case 'heading1':
        return (
          <Input
            {...commonProps}
            className="text-3xl font-bold border-none p-0 h-auto bg-transparent focus-visible:ring-0"
          />
        )
      case 'heading2':
        return (
          <Input
            {...commonProps}
            className="text-2xl font-semibold border-none p-0 h-auto bg-transparent focus-visible:ring-0"
          />
        )
      case 'heading3':
        return (
          <Input
            {...commonProps}
            className="text-xl font-medium border-none p-0 h-auto bg-transparent focus-visible:ring-0"
          />
        )
      case 'quote':
        return (
          <div className="border-l-4 border-gray-300 pl-4">
            <Textarea
              {...commonProps}
              className="italic border-none p-0 resize-none bg-transparent focus-visible:ring-0"
              rows={1}
            />
          </div>
        )
      case 'code':
        return (
          <Textarea
            {...commonProps}
            className="font-mono text-sm bg-gray-100 border rounded p-3 focus-visible:ring-1"
            rows={3}
          />
        )
      case 'divider':
        return <hr className="my-4 border-gray-300" />
      case 'todo':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={block.properties?.checked || false}
              onChange={(e) => updateBlock(block.id, { 
                properties: { ...block.properties, checked: e.target.checked }
              })}
              className="rounded"
            />
            <Input
              {...commonProps}
              className={`border-none p-0 h-auto bg-transparent focus-visible:ring-0 ${
                block.properties?.checked ? 'line-through text-gray-500' : ''
              }`}
            />
          </div>
        )
      default:
        return (
          <Textarea
            {...commonProps}
            className="border-none p-0 resize-none bg-transparent focus-visible:ring-0"
            rows={1}
          />
        )
    }
  }

  const getPlaceholder = (type: ContentBlock['type']) => {
    switch (type) {
      case 'heading1': return 'Heading 1'
      case 'heading2': return 'Heading 2'
      case 'heading3': return 'Heading 3'
      case 'quote': return 'Quote'
      case 'code': return 'Code'
      case 'todo': return 'To-do'
      default: return 'Type something...'
    }
  }

  const getBlockClassName = (type: ContentBlock['type']) => {
    const base = 'w-full'
    switch (type) {
      case 'heading1': return `${base} text-3xl font-bold`
      case 'heading2': return `${base} text-2xl font-semibold`
      case 'heading3': return `${base} text-xl font-medium`
      case 'quote': return `${base} italic`
      case 'code': return `${base} font-mono text-sm`
      default: return base
    }
  }

  // Get all properties from selected tags
  const allTagProperties = superTags
    .filter(tag => selectedTags.includes(tag.id))
    .flatMap(tag => tag.properties)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Title */}
      <Input
        ref={titleRef}
        value={title}
        onChange={(e) => updateTitle(e.target.value)}
        placeholder="Untitled"
        className="text-4xl font-bold border-none p-0 h-auto bg-transparent focus-visible:ring-0"
      />

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        {selectedTags.map(tagId => {
          const tag = superTags.find(t => t.id === tagId)
          if (!tag) return null
          
          const IconComponent = tag.icon === 'hash' ? Hash : Tag
          return (
            <Badge 
              key={tagId} 
              variant="secondary" 
              className="flex items-center gap-1"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              <IconComponent className="w-3 h-3" />
              {tag.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => updateTags(selectedTags.filter(id => id !== tagId))}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )
        })}
        
        <Popover open={isTagsOpen} onOpenChange={setIsTagsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6">
              <Plus className="w-3 h-3 mr-1" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {superTags
                  .filter(tag => !selectedTags.includes(tag.id))
                  .map(tag => {
                    const IconComponent = tag.icon === 'hash' ? Hash : Tag
                    return (
                      <CommandItem
                        key={tag.id}
                        onSelect={() => {
                          updateTags([...selectedTags, tag.id])
                          setIsTagsOpen(false)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded flex items-center justify-center text-white"
                            style={{ backgroundColor: tag.color }}
                          >
                            <IconComponent className="w-2 h-2" />
                          </div>
                          {tag.name}
                        </div>
                      </CommandItem>
                    )
                  })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Dynamic Properties from Super Tags */}
      {allTagProperties.length > 0 && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-sm text-gray-700">Properties</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allTagProperties.map(prop => (
              <div key={prop.id}>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  {prop.name}
                  {prop.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {prop.type === 'text' && (
                  <Input
                    value={properties[prop.name] || ''}
                    onChange={(e) => updateProperty(prop.name, e.target.value)}
                    placeholder={`Enter ${prop.name.toLowerCase()}...`}
                  />
                )}
                {prop.type === 'number' && (
                  <Input
                    type="number"
                    value={properties[prop.name] || ''}
                    onChange={(e) => updateProperty(prop.name, Number(e.target.value))}
                    placeholder={`Enter ${prop.name.toLowerCase()}...`}
                  />
                )}
                {prop.type === 'date' && (
                  <Input
                    type="date"
                    value={properties[prop.name] || ''}
                    onChange={(e) => updateProperty(prop.name, e.target.value)}
                  />
                )}
                {prop.type === 'checkbox' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={properties[prop.name] || false}
                      onChange={(e) => updateProperty(prop.name, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Yes</span>
                  </div>
                )}
                {(prop.type === 'select' || prop.type === 'multi_select') && prop.options && (
                  <Select
                    value={properties[prop.name] || ''}
                    onValueChange={(value) => updateProperty(prop.name, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${prop.name.toLowerCase()}...`} />
                    </SelectTrigger>
                    <SelectContent>
                      {prop.options.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Blocks */}
      <div className="space-y-2">
        {content.map((block, index) => (
          <div key={block.id} className="group relative">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                {renderBlock(block, index)}
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2">
                    <div className="grid grid-cols-2 gap-1">
                      {blockTypes.map(blockType => {
                        const IconComponent = blockType.icon
                        return (
                          <Button
                            key={blockType.type}
                            variant="ghost"
                            size="sm"
                            className="justify-start h-8"
                            onClick={() => addBlock(blockType.type as ContentBlock['type'], index)}
                          >
                            <IconComponent className="w-4 h-4 mr-2" />
                            {blockType.label}
                          </Button>
                        )
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        ))}
        
        {content.length === 0 && (
          <div className="text-center py-8">
            <Button variant="outline" onClick={() => addBlock('paragraph')}>
              <Plus className="w-4 h-4 mr-2" />
              Add your first block
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}