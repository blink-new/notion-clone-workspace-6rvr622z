import React, { useState } from 'react'
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  FileText, 
  Database, 
  Tag, 
  Search,
  Settings,
  Home,
  Trash2
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Page, SuperTag } from '../types'

interface SidebarProps {
  pages: Page[]
  superTags: SuperTag[]
  currentPageId?: string
  onPageSelect: (pageId: string) => void
  onCreatePage: (parentId?: string) => void
  onDeletePage: (pageId: string) => void
  onNavigateToTags: () => void
  onNavigateToHome: () => void
}

export function Sidebar({ 
  pages, 
  superTags, 
  currentPageId, 
  onPageSelect, 
  onCreatePage, 
  onDeletePage,
  onNavigateToTags,
  onNavigateToHome
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())

  const toggleExpanded = (pageId: string) => {
    const newExpanded = new Set(expandedPages)
    if (newExpanded.has(pageId)) {
      newExpanded.delete(pageId)
    } else {
      newExpanded.add(pageId)
    }
    setExpandedPages(newExpanded)
  }

  const getChildPages = (parentId: string) => {
    return pages.filter(page => page.parentId === parentId)
  }

  const getRootPages = () => {
    return pages.filter(page => !page.parentId)
  }

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderPageTree = (pageList: Page[], level = 0) => {
    return pageList.map(page => {
      const childPages = getChildPages(page.id)
      const hasChildren = childPages.length > 0
      const isExpanded = expandedPages.has(page.id)
      const isSelected = currentPageId === page.id

      return (
        <div key={page.id}>
          <div 
            className={`flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer group ${
              isSelected ? 'bg-blue-100 text-blue-700' : ''
            }`}
            style={{ paddingLeft: `${8 + level * 16}px` }}
          >
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpanded(page.id)
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </Button>
            ) : (
              <div className="w-4" />
            )}
            
            <div 
              className="flex-1 flex items-center gap-2 min-w-0"
              onClick={() => onPageSelect(page.id)}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-sm">
                {page.title || 'Untitled'}
              </span>
              
              {page.tags.length > 0 && (
                <div className="flex gap-1 ml-auto">
                  {page.tags.slice(0, 2).map(tagId => {
                    const tag = superTags.find(t => t.id === tagId)
                    if (!tag) return null
                    return (
                      <div
                        key={tagId}
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                        title={tag.name}
                      />
                    )
                  })}
                  {page.tags.length > 2 && (
                    <span className="text-xs text-gray-500">+{page.tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>

            <div className="opacity-0 group-hover:opacity-100 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onCreatePage(page.id)
                }}
              >
                <Plus className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeletePage(page.id)
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {hasChildren && isExpanded && (
            <div>
              {renderPageTree(childPages, level + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">Workspace</h1>
      </div>

      {/* Navigation */}
      <div className="p-2 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onNavigateToHome}
        >
          <Home className="w-4 h-4 mr-2" />
          Home
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onNavigateToTags}
        >
          <Tag className="w-4 h-4 mr-2" />
          Super Tags
          <Badge variant="secondary" className="ml-auto">
            {superTags.length}
          </Badge>
        </Button>
      </div>

      {/* Search */}
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8"
          />
        </div>
      </div>

      {/* Pages */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Pages</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onCreatePage()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {searchQuery ? (
              filteredPages.length > 0 ? (
                renderPageTree(filteredPages)
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">
                  No pages found
                </div>
              )
            ) : (
              getRootPages().length > 0 ? (
                renderPageTree(getRootPages())
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  No pages yet
                  <br />
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-blue-600"
                    onClick={() => onCreatePage()}
                  >
                    Create your first page
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200">
        <Button variant="ghost" className="w-full justify-start" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  )
}