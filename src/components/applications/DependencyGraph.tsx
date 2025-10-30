import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getApplications } from '@/services/applicationService'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
  NodeProps,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Application } from '@/types/application'
import { Database } from 'lucide-react'

function CustomApplicationNode({ data }: NodeProps) {
  return (
    <div style={data.nodeStyle}>
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
      {data.label}
    </div>
  )
}

interface DependencyGraphProps {
  applicationId: string
}

const getCriticalityColor = (criticality: string) => {
  switch (criticality) {
    case 'P1':
      return '#ef4444'
    case 'P2':
      return '#f59e0b'
    case 'P3':
      return '#6b7280'
    default:
      return '#3b82f6'
  }
}

const getDatastoreColor = (type: string) => {
  switch (type) {
    case 'postgresql':
    case 'mysql':
      return '#336791'
    case 'mongodb':
      return '#47A248'
    case 'redis':
      return '#DC382D'
    case 's3':
      return '#FF9900'
    case 'elasticsearch':
      return '#005571'
    case 'dynamodb':
      return '#527FFF'
    case 'kafka':
      return '#231F20'
    default:
      return '#6366f1'
  }
}

const NODE_WIDTH = 200
const NODE_HEIGHT = 80
const HORIZONTAL_SPACING = 100
const VERTICAL_SPACING = 250

const nodeTypes = {
  customApplication: CustomApplicationNode,
}

export function DependencyGraph({ applicationId }: DependencyGraphProps) {
  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  })

  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([])

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (applications.length === 0) return { nodes: [], edges: [] }

    const targetApp = applications.find((app: Application) => app.id === applicationId)
    if (!targetApp) return { nodes: [], edges: [] }

    const nodesMap = new Map<string, Node>()
    const edgesArray: Edge[] = []
    const levelMap = new Map<string, number>()
    const visited = new Set<string>()

    const calculateLevels = (appId: string, level: number, isDownstream: boolean) => {
      if (visited.has(appId)) return
      visited.add(appId)

      const currentLevel = levelMap.get(appId)
      if (currentLevel === undefined || level > currentLevel) {
        levelMap.set(appId, level)
      }

      const app = applications.find((a: Application) => a.id === appId)
      if (!app) return

      if (isDownstream) {
        app.dependencies.forEach((depId) => {
          calculateLevels(depId, level + 1, true)
        })
      }
    }

    calculateLevels(applicationId, 0, true)

    const directDependents = applications.filter((a: Application) =>
      a.dependencies.includes(applicationId)
    )
    directDependents.forEach((dep) => {
      if (!visited.has(dep.id)) {
        visited.add(dep.id)
        levelMap.set(dep.id, -1)
      }
    })

    const nodesByLevel = new Map<number, string[]>()
    levelMap.forEach((level, appId) => {
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, [])
      }
      nodesByLevel.get(level)!.push(appId)
    })

    const minLevel = Math.min(...Array.from(levelMap.values()))
    const maxLevel = Math.max(...Array.from(levelMap.values()))
    const datastoreLevel = maxLevel + 1

    levelMap.forEach((level, appId) => {
      const app = applications.find((a: Application) => a.id === appId)
      if (!app) return

      const nodesAtLevel = nodesByLevel.get(level) || []
      const indexAtLevel = nodesAtLevel.indexOf(appId)
      const totalAtLevel = nodesAtLevel.length

      const normalizedLevel = level - minLevel
      const y = normalizedLevel * VERTICAL_SPACING + 50

      const totalWidth = (totalAtLevel - 1) * (NODE_WIDTH + HORIZONTAL_SPACING)
      const startX = -totalWidth / 2 + 400
      const x = startX + indexAtLevel * (NODE_WIDTH + HORIZONTAL_SPACING)

      const isTarget = app.id === applicationId
      const criticalityColor = getCriticalityColor(app.criticality)

      const nodeStyle = {
        background: isTarget ? criticalityColor : 'hsl(var(--color-card))',
        border: `3px solid ${criticalityColor}`,
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: isTarget
          ? '0 8px 16px rgba(0, 0, 0, 0.2)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        width: NODE_WIDTH,
        minHeight: NODE_HEIGHT,
      }

      nodesMap.set(app.id, {
        id: app.id,
        type: 'customApplication',
        position: { x, y },
        data: {
          label: (
            <div className="text-center px-2">
              <div className={`font-bold text-sm ${isTarget ? 'text-primary-foreground' : 'text-foreground'}`}>
                {app.name}
              </div>
              <div className={`text-xs mt-1 font-semibold ${isTarget ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                {app.criticality} • {app.department}
              </div>
            </div>
          ),
          nodeStyle,
        },
      })

      app.dependencies.forEach((depId) => {
        const dep = applications.find((a: Application) => a.id === depId)
        if (!dep) return

        edgesArray.push({
          id: `${app.id}-${depId}`,
          source: app.id,
          target: depId,
          sourceHandle: 'bottom',
          targetHandle: 'top',
          animated: isTarget,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: getCriticalityColor(dep.criticality),
          },
          style: {
            stroke: getCriticalityColor(dep.criticality),
            strokeWidth: isTarget ? 3 : 2,
          },
          label: 'depends on',
          labelStyle: {
            fill: '#666',
            fontSize: 10,
            fontWeight: 500,
          },
        })
      })

      if (app.id === applicationId && app.datastores && app.datastores.length > 0) {
        const datastoreCount = app.datastores.length
        const datastoreSpacing = 100
        const datastoreOffsetX = NODE_WIDTH + 200

        app.datastores.forEach((datastore, index) => {
          const datastoreNodeId = `${app.id}-datastore-${datastore.id}`
          const datastoreX = x + datastoreOffsetX
          const datastoreY = y + (index - (datastoreCount - 1) / 2) * datastoreSpacing
          const datastoreColor = getDatastoreColor(datastore.type)

          nodesMap.set(datastoreNodeId, {
            id: datastoreNodeId,
            type: 'default',
            position: { x: datastoreX, y: datastoreY },
            data: {
              label: (
                <div className="text-center px-2 flex flex-col items-center gap-1">
                  <Database className="h-5 w-5" style={{ color: datastoreColor }} />
                  <div className="font-bold text-xs text-foreground">{datastore.name}</div>
                  <div className="text-[10px] text-muted-foreground capitalize">{datastore.type}</div>
                </div>
              ),
            },
            style: {
              background: 'hsl(var(--color-card))',
              border: `3px solid ${datastoreColor}`,
              borderRadius: 40,
              padding: '12px 20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              width: 180,
              minHeight: 80,
            },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
          })

          edgesArray.push({
            id: `${app.id}-${datastoreNodeId}`,
            source: app.id,
            target: datastoreNodeId,
            sourceHandle: 'right',
            animated: false,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: datastoreColor,
            },
            style: {
              stroke: datastoreColor,
              strokeWidth: 2,
              strokeDasharray: '5,5',
            },
            label: 'uses',
            labelStyle: {
              fill: '#666',
              fontSize: 10,
              fontWeight: 500,
            },
          })
        })
      }
    })

    return {
      nodes: Array.from(nodesMap.values()),
      edges: edgesArray,
    }
  }, [applications, applicationId])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const connectedNodeIds = edges
        .filter((edge) => edge.source === node.id || edge.target === node.id)
        .flatMap((edge) => [edge.source, edge.target])
        .filter((id) => id !== node.id)

      setHighlightedNodes([node.id, ...connectedNodeIds])

      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          style: {
            ...n.style,
            opacity: highlightedNodes.length === 0 || [node.id, ...connectedNodeIds].includes(n.id) ? 1 : 0.3,
          },
        }))
      )

      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          style: {
            ...e.style,
            opacity:
              highlightedNodes.length === 0 ||
              (e.source === node.id || e.target === node.id)
                ? 1
                : 0.2,
          },
        }))
      )
    },
    [edges, setNodes, setEdges, highlightedNodes]
  )

  const onPaneClick = useCallback(() => {
    setHighlightedNodes([])
    setNodes((nds) => nds.map((n) => ({ ...n, style: { ...n.style, opacity: 1 } })))
    setEdges((eds) => eds.map((e) => ({ ...e, style: { ...e.style, opacity: 1 } })))
  }, [setNodes, setEdges])

  if (applications.length === 0) {
    return <div className="h-96 flex items-center justify-center text-muted-foreground">Loading graph...</div>
  }

  return (
    <div className="h-[700px] border-2 border-border/50 rounded-2xl bg-gradient-to-br from-background to-primary/5 overflow-hidden shadow-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Controls className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-md" />
        <Background gap={20} size={1} className="[&_path]:stroke-border" />
      </ReactFlow>
      <div className="p-6 bg-card/80 backdrop-blur-sm border-t-2 border-border/50">
        <div className="flex flex-wrap items-center gap-6">
          <span className="font-bold text-foreground">Legend:</span>
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
            <span className="text-sm font-medium">P1 Critical</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-sm"></div>
            <span className="text-sm font-medium">P2 Important</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-gray-500 shadow-sm"></div>
            <span className="text-sm font-medium">P3 Standard</span>
          </div>
          <span className="ml-auto text-sm text-muted-foreground italic">
            Click nodes to highlight • Drag to move • Scroll to zoom
          </span>
        </div>
      </div>
    </div>
  )
}
