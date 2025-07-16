export interface SuperTag {
  id: string
  name: string
  color: string
  icon?: string
  description?: string
  template?: PageTemplate
  properties: TagProperty[]
  createdAt: Date
  updatedAt: Date
}

export interface TagProperty {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'multi_select' | 'checkbox' | 'url' | 'email'
  options?: string[] // For select/multi_select types
  required?: boolean
  defaultValue?: any
}

export interface PageTemplate {
  blocks: ContentBlock[]
  properties: Record<string, any>
}

export interface Page {
  id: string
  title: string
  content: ContentBlock[]
  parentId?: string
  icon?: string
  coverImage?: string
  tags: string[] // Super tag IDs
  properties: Record<string, any> // Dynamic properties from super tags
  isTemplate: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ContentBlock {
  id: string
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulleted_list' | 'numbered_list' | 'todo' | 'quote' | 'code' | 'divider' | 'image'
  content: string
  properties?: Record<string, any>
  children?: ContentBlock[]
}

export interface Database {
  id: string
  name: string
  description?: string
  schema: DatabaseProperty[]
  viewType: 'table' | 'kanban' | 'calendar' | 'gallery'
  items: DatabaseItem[]
  createdAt: Date
  updatedAt: Date
}

export interface DatabaseProperty {
  id: string
  name: string
  type: 'title' | 'text' | 'number' | 'select' | 'multi_select' | 'date' | 'checkbox' | 'url' | 'email' | 'relation'
  options?: string[]
}

export interface DatabaseItem {
  id: string
  properties: Record<string, any>
  createdAt: Date
  updatedAt: Date
}