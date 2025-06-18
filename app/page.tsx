"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  type DragEndEvent,
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanProvider,
} from "@/components/ui/shadcn-io/kanban"
import { useState, useEffect } from "react"
import { Plus, X, Calendar, Folder } from "lucide-react"

/**
 * Date formatter for displaying short dates (e.g., "Jan 15")
 */
const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
})

/**
 * Fetches kanban data from external API
 * @returns Promise<any> - Returns the fetched data or null if error occurs
 */
async function fetchData() {
  try {
    const response = await fetch("https://dummyjson.com/c/e9ec-093c-47b6-a3ae")

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    console.log("Fetched data:", data)
    return data
  } catch (error) {
    console.error("Error fetching data:", error)
    return null
  }
}

/**
 * Returns a random color scheme object for new columns
 * @returns Object with background, light, and text colors
 */
const getRandomColor = () => {
  const colors = [
    { bg: "#EF4444", light: "#FEF2F2", text: "#991B1B" }, // Red
    { bg: "#F97316", light: "#FFF7ED", text: "#9A3412" }, // Orange
    { bg: "#EAB308", light: "#FEFCE8", text: "#854D0E" }, // Yellow
    { bg: "#22C55E", light: "#F0FDF4", text: "#166534" }, // Green
    { bg: "#06B6D4", light: "#F0F9FF", text: "#0C4A6E" }, // Cyan
    { bg: "#8B5CF6", light: "#FAF5FF", text: "#581C87" }, // Purple
    { bg: "#EC4899", light: "#FDF2F8", text: "#9D174D" }, // Pink
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * TypeScript interface for Kanban data structure
 */
interface IKanbanDetails {
  features: {
    id: string
    name: string
    startAt: string
    endAt: string
    statusId: string
    owner: {
      id: string
      name: string
      image: string
    }
    initiative: {
      id: string
      name: string
    }
    release: {
      id: string
      name: string
    }
  }[]
  statuses: {
    id: string
    name: string
    color: string
  }[]
}

/**
 * TypeScript interface for processed feature data
 */
interface IFeature {
  id: string
  name: string
  startAt: Date
  endAt: Date
  statusId: string
  status: {
    id: string
    name: string
    color: string
  }
  owner: {
    id: string
    name: string
    image: string
  }
  initiative: {
    id: string
    name: string
  }
  release: {
    id: string
    name: string
  }
}

/**
 * TypeScript interface for status/column data
 */
interface IStatus {
  id: string
  name: string
  color: string
  lightColor?: string
  textColor?: string
}

/**
 * Main Dynamic Kanban Board Component
 * Provides drag-and-drop functionality, dynamic column management, and API data integration
 */
const DynamicKanbanBoard = () => {
  // State management for kanban board data
  const [statuses, setStatuses] = useState<IStatus[]>([])
  const [features, setFeatures] = useState<IFeature[]>([])
  const [newColumnName, setNewColumnName] = useState("")
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [kanbanDetails, setKanbanDetails] = useState<IKanbanDetails>()
  const [loading, setLoading] = useState(true)

  /**
   * Effect hook to fetch initial data from API on component mount
   */
  useEffect(() => {
    setLoading(true)
    fetchData().then((data) => {
      if (data) {
        setKanbanDetails(data)
      }
      setLoading(false)
    })
  }, [])

  /**
   * Effect hook to process fetched data and update component state
   * Converts date strings to Date objects and links features to their status
   */
  useEffect(() => {
    if (!kanbanDetails) return

    const processedFeatures = kanbanDetails.features?.map((feature) => ({
      ...feature,
      startAt: new Date(feature.startAt),
      endAt: new Date(feature.endAt),
      status: kanbanDetails.statuses?.find((s) => s.id === feature.statusId) || kanbanDetails.statuses[0],
    }))

    setStatuses(kanbanDetails.statuses ?? [])
    setFeatures(processedFeatures || [])
  }, [kanbanDetails])

  /**
   * Handles drag and drop events when moving cards between columns
   * @param event - DragEndEvent containing information about the drag operation
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    // Exit if dropped outside a valid drop zone
    if (!over) {
      return
    }

    // Find the target status/column
    const status = statuses.find((status: IStatus) => status.name === over.id)

    if (!status) {
      return
    }

    // Update the feature's status when moved to a new column
    setFeatures(
      features.map((feature: IFeature) => {
        if (feature.id === active.id) {
          return { ...feature, status, statusId: status.id }
        }
        return feature
      }),
    )
  }

  /**
   * Adds a new column/status to the kanban board
   * Generates a random color scheme for the new column
   */
  const addNewColumn = () => {
    // Validate input
    if (!newColumnName.trim()) return

    // Generate color scheme for new column
    const colorScheme = getRandomColor()
    const newStatus: IStatus = {
      id: Date.now().toString(),
      name: newColumnName.trim(),
      color: colorScheme.bg,
      lightColor: colorScheme.light,
      textColor: colorScheme.text,
    }

    // Update state and reset form
    setStatuses([...statuses, newStatus])
    setNewColumnName("")
    setIsAddingColumn(false)
  }

  /**
   * Deletes a column/status from the kanban board
   * Prevents deletion if column contains features
   * @param statusId - ID of the status to delete
   */
  const deleteColumn = (statusId: string) => {
    // Check if column contains any features
    const hasFeatures = features.some((feature: IFeature) => feature.status.id === statusId)
    if (hasFeatures) {
      alert("Cannot delete column with existing items. Please move or delete items first.")
      return
    }

    // Remove column from state
    setStatuses(statuses.filter((status: IStatus) => status.id !== statusId))
  }

  /**
   * Handles keyboard events for the new column input
   * Enter key: adds the column
   * Escape key: cancels column creation
   * @param e - React keyboard event
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addNewColumn()
    } else if (e.key === "Escape") {
      setIsAddingColumn(false)
      setNewColumnName("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Project Dashboard
              </h1>
              <p className="text-slate-600 mt-2">Manage your tasks and track progress</p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border">
                <Folder className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-slate-700">{features?.length || 0}</span>
                <span className="text-slate-500">Tasks</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-slate-700">{statuses?.length || 0}</span>
                <span className="text-slate-500">Columns</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="flex gap-6 overflow-x-auto pb-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="min-w-80 bg-white rounded-xl shadow-sm border p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-slate-200 rounded-lg w-24 animate-pulse" />
                    <div className="h-6 w-8 bg-slate-200 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <KanbanProvider onDragEnd={handleDragEnd} className="flex gap-6 overflow-x-auto pb-6">
            {statuses?.map((status: { id: string; name: string; color: string }) => (
              <KanbanBoard key={status.id} id={status.name} className="min-w-80">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  {/* Column Header */}
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                        <h3 className="font-semibold text-slate-800">{status.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                          {features.filter((f: { status: { id: string } }) => f.status.id === status.id).length}
                        </span>
                        <button
                          onClick={() => deleteColumn(status.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors"
                          title="Delete column"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cards Container */}
                  <div className="p-4">
                    <KanbanCards>
                      {features
                        .filter((feature: { status: { id: string } }) => feature.status.id === status.id)
                        .map((feature: any, index: number) => (
                          <KanbanCard
                            key={feature.id}
                            id={feature.id}
                            name={feature.name}
                            parent={status.name}
                            index={index}
                          >
                            <div className="bg-gradient-to-br from-white to-slate-50/50 transition-all duration-300 hover:border-slate-300/80 cursor-pointer">
                              {/* Priority Indicator */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-1 h-8 rounded-full shadow-sm"
                                    style={{ backgroundColor: feature.status.color }}
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                                      {feature.initiative.name}
                                    </span>
                                  </div>
                                </div>
                                {feature.owner && (
                                  <div className="relative">
                                    <Avatar className="h-8 w-8 shrink-0 ring-2 ring-white shadow-md hover:ring-blue-200 transition-all duration-200">
                                      <AvatarImage src={feature.owner.image || "/placeholder.svg"} />
                                      <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white">
                                        {feature.owner.name?.slice(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                                  </div>
                                )}
                              </div>

                              {/* Card Title */}
                              <div className="mb-4">
                                <h4 className="font-semibold text-slate-800 text-base leading-snug group-hover:text-slate-900 transition-colors line-clamp-2">
                                  {feature.name}
                                </h4>
                              </div>

                              {/* Progress Section */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-slate-500">Progress</span>
                                  <span className="text-xs font-semibold text-slate-700">{feature.progress}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                    style={{ width: `${feature.progress}%` }}
                                  />
                                </div>
                              </div>

                              {/* Tags Section */}
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></div>
                                  Frontend
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                                  High Priority
                                </span>
                              </div>

                              {/* Footer */}
                              <div className="flex items-center justify-between pt-4 border-t border-slate-100/80">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                                    <Calendar className="w-3 h-3" />
                                    <span className="font-medium">{shortDateFormatter.format(feature.startAt)}</span>
                                  </div>
                                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                  <div className="text-xs text-slate-400">
                                    {Math.ceil((feature.endAt - feature.startAt) / (1000 * 60 * 60 * 24))} days
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full text-white shadow-sm ring-1 ring-white/20"
                                    style={{ backgroundColor: feature.status.color }}
                                  >
                                    {feature.release.name}
                                  </span>
                                </div>
                              </div>

                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                          </KanbanCard>
                        ))}
                    </KanbanCards>
                  </div>
                </div>
              </KanbanBoard>
            ))}

            {/* Add Column Section */}
            <div className="min-w-80">
              {isAddingColumn ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800">Add New Column</h3>
                    <input
                      type="text"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      onKeyDown={handleKeyPress}
                      onBlur={() => {
                        if (!newColumnName.trim()) {
                          setIsAddingColumn(false)
                        }
                      }}
                      placeholder="Enter column name..."
                      className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={addNewColumn}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
                      >
                        Add Column
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingColumn(false)
                          setNewColumnName("")
                        }}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all duration-200 group"
                >
                  <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-blue-50 transition-colors">
                    <Plus size={20} />
                  </div>
                  <span className="font-medium">Add Column</span>
                </button>
              )}
            </div>
          </KanbanProvider>
        )}
      </div>
    </div>
  )
}

export default DynamicKanbanBoard
