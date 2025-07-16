import React, { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { SuperTagManager } from './components/SuperTagManager'
import { NovelEditor } from './components/NovelEditor'
import { Sidebar } from './components/Sidebar'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { FileText, Tag, Zap, Database, Users, Search } from 'lucide-react'
import { SuperTag, Page, ContentBlock } from './types'
import toast from 'react-hot-toast'

type View = 'home' | 'tags' | 'page'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<View>('home')
  const [currentPageId, setCurrentPageId] = useState<string | undefined>()
  
  // Data state
  const [superTags, setSuperTags] = useState<SuperTag[]>([])
  const [pages, setPages] = useState<Page[]>([])

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  // Initialize with sample data
  useEffect(() => {
    if (user && superTags.length === 0) {
      // Create sample super tags
      const sampleTags: SuperTag[] = [
        {
          id: 'tag-1',
          name: 'Project',
          color: '#3B82F6',
          icon: 'tag',
          description: 'Project-related pages with status tracking',
          properties: [
            { id: 'prop-1', name: 'Status', type: 'select', options: ['Planning', 'In Progress', 'Completed', 'On Hold'], required: true },
            { id: 'prop-2', name: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'], required: false },
            { id: 'prop-3', name: 'Due Date', type: 'date', required: false },
            { id: 'prop-4', name: 'Team Members', type: 'text', required: false }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'tag-2',
          name: 'Meeting',
          color: '#10B981',
          icon: 'hash',
          description: 'Meeting notes with attendees and action items',
          properties: [
            { id: 'prop-5', name: 'Date', type: 'date', required: true },
            { id: 'prop-6', name: 'Attendees', type: 'text', required: false },
            { id: 'prop-7', name: 'Meeting Type', type: 'select', options: ['Standup', 'Planning', 'Review', 'Retrospective', 'One-on-One'], required: false },
            { id: 'prop-8', name: 'Action Items', type: 'text', required: false }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'tag-3',
          name: 'Research',
          color: '#8B5CF6',
          icon: 'tag',
          description: 'Research documents and findings',
          properties: [
            { id: 'prop-9', name: 'Research Type', type: 'select', options: ['Market Research', 'User Research', 'Technical Research', 'Competitive Analysis'], required: false },
            { id: 'prop-10', name: 'Confidence Level', type: 'select', options: ['Low', 'Medium', 'High'], required: false },
            { id: 'prop-11', name: 'Sources', type: 'text', required: false }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      setSuperTags(sampleTags)

      // Create sample pages
      const samplePages: Page[] = [
        {
          id: 'page-1',
          title: 'Q1 Product Roadmap',
          content: [
            { id: 'block-1', type: 'heading1', content: 'Q1 Product Roadmap', properties: {} },
            { id: 'block-2', type: 'paragraph', content: 'This document outlines our product roadmap for the first quarter.', properties: {} },
            { id: 'block-3', type: 'heading2', content: 'Key Features', properties: {} },
            { id: 'block-4', type: 'bulleted_list', content: 'Super Tags implementation', properties: {} },
            { id: 'block-5', type: 'bulleted_list', content: 'Advanced search functionality', properties: {} },
            { id: 'block-6', type: 'bulleted_list', content: 'Real-time collaboration', properties: {} }
          ],
          tags: ['tag-1'],
          properties: {
            'Status': 'In Progress',
            'Priority': 'High',
            'Due Date': '2024-03-31',
            'Team Members': 'Alice, Bob, Charlie'
          },
          isTemplate: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'page-2',
          title: 'Weekly Team Standup - Jan 15',
          content: [
            { id: 'block-7', type: 'heading1', content: 'Weekly Team Standup', properties: {} },
            { id: 'block-8', type: 'paragraph', content: 'Date: January 15, 2024', properties: {} },
            { id: 'block-9', type: 'heading2', content: 'Agenda', properties: {} },
            { id: 'block-10', type: 'todo', content: 'Review last week\'s progress', properties: { checked: true } },
            { id: 'block-11', type: 'todo', content: 'Discuss current blockers', properties: { checked: false } },
            { id: 'block-12', type: 'todo', content: 'Plan next week\'s priorities', properties: { checked: false } }
          ],
          tags: ['tag-2'],
          properties: {
            'Date': '2024-01-15',
            'Attendees': 'Alice, Bob, Charlie, Diana',
            'Meeting Type': 'Standup',
            'Action Items': 'Follow up on API integration, Schedule design review'
          },
          isTemplate: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'page-3',
          title: 'User Research Findings',
          content: [
            { id: 'block-13', type: 'heading1', content: 'User Research Findings', properties: {} },
            { id: 'block-14', type: 'paragraph', content: 'Key insights from our recent user interviews and surveys.', properties: {} },
            { id: 'block-15', type: 'heading2', content: 'Key Findings', properties: {} },
            { id: 'block-16', type: 'quote', content: 'Users want better organization tools for their content', properties: {} },
            { id: 'block-17', type: 'paragraph', content: '85% of users expressed interest in tag-based organization systems.', properties: {} }
          ],
          tags: ['tag-3'],
          properties: {
            'Research Type': 'User Research',
            'Confidence Level': 'High',
            'Sources': 'User interviews (n=20), Survey responses (n=150)'
          },
          isTemplate: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      setPages(samplePages)
    }
  }, [user, superTags.length])

  // Super tag management
  const handleCreateTag = (tagData: Omit<SuperTag, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTag: SuperTag = {
      ...tagData,
      id: `tag-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setSuperTags(prev => [...prev, newTag])
    toast.success('Super tag created successfully!')
  }

  const handleUpdateTag = (id: string, updates: Partial<SuperTag>) => {
    setSuperTags(prev => prev.map(tag => 
      tag.id === id ? { ...tag, ...updates, updatedAt: new Date() } : tag
    ))
    toast.success('Super tag updated successfully!')
  }

  const handleDeleteTag = (id: string) => {
    setSuperTags(prev => prev.filter(tag => tag.id !== id))
    // Remove tag from all pages
    setPages(prev => prev.map(page => ({
      ...page,
      tags: page.tags.filter(tagId => tagId !== id)
    })))
    toast.success('Super tag deleted successfully!')
  }

  // Page management
  const handleCreatePage = (parentId?: string) => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      title: 'Untitled',
      content: [],
      parentId,
      tags: [],
      properties: {},
      isTemplate: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setPages(prev => [...prev, newPage])
    setCurrentPageId(newPage.id)
    setCurrentView('page')
    toast.success('New page created!')
  }

  const handleUpdatePage = (pageId: string, updates: Partial<Page>) => {
    setPages(prev => prev.map(page => 
      page.id === pageId ? { ...page, ...updates, updatedAt: new Date() } : page
    ))
  }

  const handleDeletePage = (pageId: string) => {
    setPages(prev => prev.filter(page => page.id !== pageId))
    if (currentPageId === pageId) {
      setCurrentView('home')
      setCurrentPageId(undefined)
    }
    toast.success('Page deleted successfully!')
  }

  const handlePageSelect = (pageId: string) => {
    setCurrentPageId(pageId)
    setCurrentView('page')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workspace...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <FileText className="w-6 h-6" />
              Notion Clone
            </CardTitle>
            <p className="text-muted-foreground">
              Your all-in-one workspace with super tags
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Please sign in to access your workspace</p>
            <Button onClick={() => blink.auth.login()}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentPage = currentPageId ? pages.find(p => p.id === currentPageId) : undefined

  const renderContent = () => {
    switch (currentView) {
      case 'tags':
        return (
          <SuperTagManager
            superTags={superTags}
            onCreateTag={handleCreateTag}
            onUpdateTag={handleUpdateTag}
            onDeleteTag={handleDeleteTag}
          />
        )
      case 'page':
        return currentPage ? (
          <NovelEditor
            page={currentPage}
            superTags={superTags}
            onUpdatePage={(updates) => handleUpdatePage(currentPage.id, updates)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Page not found</p>
          </div>
        )
      default:
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Welcome to your Workspace</h1>
              <p className="text-xl text-gray-600">
                Organize your thoughts with super tags and structured content
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setCurrentView('tags')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-blue-600" />
                    Super Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">
                    Create powerful, structured tags with custom properties
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{superTags.length}</span>
                    <span className="text-sm text-gray-500">tags created</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleCreatePage()}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Pages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">
                    Create and organize your content with block-based editing
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{pages.length}</span>
                    <span className="text-sm text-gray-500">pages created</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => handleCreatePage()}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      New Page
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setCurrentView('tags')}
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      Manage Tags
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {pages.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Recent Pages</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pages.slice(0, 4).map(page => (
                    <Card 
                      key={page.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handlePageSelect(page.id)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {page.title || 'Untitled'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 mb-2">
                          {page.tags.map(tagId => {
                            const tag = superTags.find(t => t.id === tagId)
                            if (!tag) return null
                            return (
                              <div
                                key={tagId}
                                className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: `${tag.color}20`, 
                                  color: tag.color 
                                }}
                              >
                                {tag.name}
                              </div>
                            )
                          })}
                        </div>
                        <p className="text-sm text-gray-600">
                          {page.content.length} blocks • Updated {page.updatedAt.toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        pages={pages}
        superTags={superTags}
        currentPageId={currentPageId}
        onPageSelect={handlePageSelect}
        onCreatePage={handleCreatePage}
        onDeletePage={handleDeletePage}
        onNavigateToTags={() => setCurrentView('tags')}
        onNavigateToHome={() => setCurrentView('home')}
      />
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  )
}

export default App