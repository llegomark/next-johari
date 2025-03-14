'use client'

import { useRef, useState, useEffect } from 'react'
import { useJohari } from './JohariProvider'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { useIsMobile } from '@/hooks/use-mobile'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, RotateCcw, MoveHorizontal, Maximize } from 'lucide-react'

// Parser function to extract items from comma-separated string
function parseItems(text: string): string[] {
    if (!text) return []
    return text.split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)
}

export function JohariVisualization() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { johariData } = useJohari()
    const isMobile = useIsMobile()

    // State for selected quadrant modal
    const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null)
    const [quadrantTitle, setQuadrantTitle] = useState('')
    const [quadrantItems, setQuadrantItems] = useState<string[]>([])

    // Refs for Three.js objects
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const frameIdRef = useRef<number | null>(null)
    const controlsRef = useRef<OrbitControls | null>(null)
    const threejsInitializedRef = useRef<boolean>(false)

    // Window objects refs (for animation and interaction)
    const windowRefs = useRef<{ [key: string]: THREE.Group }>({})

    // Parse all items for display
    const parsedData = {
        openSelf: parseItems(johariData.openSelf),
        blindSelf: parseItems(johariData.blindSelf),
        hiddenSelf: parseItems(johariData.hiddenSelf),
        unknownSelf: parseItems(johariData.unknownSelf)
    }

    // Clean up function to properly dispose of Three.js resources
    const cleanup = () => {
        if (frameIdRef.current !== null) {
            cancelAnimationFrame(frameIdRef.current)
            frameIdRef.current = null
        }

        if (controlsRef.current) {
            controlsRef.current.dispose()
            controlsRef.current = null
        }

        // Safely dispose of renderer and remove its domElement
        if (rendererRef.current) {
            if (containerRef.current && rendererRef.current.domElement.parentNode === containerRef.current) {
                try {
                    containerRef.current.removeChild(rendererRef.current.domElement)
                } catch (err) {
                    console.error("Error removing domElement:", err)
                }
            }
            rendererRef.current.dispose()
            rendererRef.current = null
        }

        // Clean up scene resources
        if (sceneRef.current) {
            // Dispose of all geometries and materials
            sceneRef.current.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    if (object.geometry) {
                        object.geometry.dispose()
                    }

                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(material => material.dispose())
                        } else {
                            object.material.dispose()
                        }
                    }
                }
            })

            // Clear scene children safely
            const children = [...sceneRef.current.children]
            children.forEach(child => {
                sceneRef.current?.remove(child)
            })

            sceneRef.current = null
        }

        // Clear camera ref
        cameraRef.current = null

        // Clear window refs
        windowRefs.current = {}

        // Reset initialization flag
        threejsInitializedRef.current = false
    }

    // Initialize Three.js scene and handle responsive layout
    useEffect(() => {
        // Flag to prevent operations after component unmounts
        let isActive = true

        // Only initialize once
        if (threejsInitializedRef.current) return

        // This function initializes the 3D scene
        const initializeScene = () => {
            if (!containerRef.current || !isActive) return

            // Clean up any existing scene first
            cleanup()

            try {
                // Mark as initialized
                threejsInitializedRef.current = true

                // Initialize scene
                const scene = new THREE.Scene()
                scene.background = new THREE.Color(0xf7f9fc)
                sceneRef.current = scene

                // Camera setup - adjust for device
                const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
                const camera = new THREE.PerspectiveCamera(
                    isMobile ? 70 : 60,
                    aspect,
                    0.1,
                    1000
                )
                camera.position.z = isMobile ? 6 : 5
                cameraRef.current = camera

                // Renderer setup
                const renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance'
                })
                renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
                renderer.shadowMap.enabled = true
                rendererRef.current = renderer

                // Clear container of any existing content
                while (containerRef.current.firstChild) {
                    containerRef.current.removeChild(containerRef.current.firstChild)
                }

                // Append renderer to DOM
                containerRef.current.appendChild(renderer.domElement)

                // Initialize controls AFTER camera and renderer are set up
                const controls = new OrbitControls(camera, renderer.domElement)
                controls.enableDamping = true
                controls.dampingFactor = 0.1
                controls.maxDistance = 10
                controls.minDistance = 3
                controls.maxPolarAngle = Math.PI / 1.8
                controlsRef.current = controls

                // Lighting for better visuals
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
                scene.add(ambientLight)

                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
                directionalLight.position.set(5, 5, 5)
                directionalLight.castShadow = true
                directionalLight.shadow.mapSize.width = 1024
                directionalLight.shadow.mapSize.height = 1024
                scene.add(directionalLight)

                // Create a window quadrant with items
                const createWindow = (
                    key: string,
                    title: string,
                    position: [number, number, number],
                    color: string,
                    items: string[]
                ) => {
                    // Scale for mobile
                    const scale = isMobile ? 0.8 : 1
                    const framePadding = isMobile ? 2.0 : 2.2

                    // Create group to hold all window elements
                    const group = new THREE.Group()
                    group.position.set(...position)
                    group.scale.set(scale, scale, scale)
                    group.userData = { key, title, items, isJohariWindow: true }

                    // Window frame
                    const frameGeometry = new THREE.BoxGeometry(framePadding, framePadding, 0.2)
                    const frameMaterial = new THREE.MeshStandardMaterial({
                        color: 0xf0f0f0,
                        metalness: 0.1,
                        roughness: 0.7
                    })
                    const frame = new THREE.Mesh(frameGeometry, frameMaterial)
                    frame.castShadow = true
                    frame.receiveShadow = true
                    group.add(frame)

                    // Window inner pane
                    const glassSize = framePadding - 0.2
                    const glassGeometry = new THREE.BoxGeometry(glassSize, glassSize, 0.1)
                    const glassMaterial = new THREE.MeshPhysicalMaterial({
                        color: color,
                        transparent: true,
                        opacity: 0.6,
                        metalness: 0.2,
                        roughness: 0.3,
                        clearcoat: 1,
                        clearcoatRoughness: 0.1
                    })
                    const glass = new THREE.Mesh(glassGeometry, glassMaterial)
                    glass.position.z = 0.06
                    glass.castShadow = true
                    glass.receiveShadow = true
                    glass.userData = { interactive: true, key, title, items }
                    group.add(glass)

                    // Window dividers
                    const dividerHGeometry = new THREE.BoxGeometry(framePadding, 0.08, 0.22)
                    const dividerH = new THREE.Mesh(dividerHGeometry, frameMaterial)
                    dividerH.position.y = 0
                    dividerH.position.z = 0.01
                    dividerH.castShadow = true
                    dividerH.receiveShadow = true
                    group.add(dividerH)

                    const dividerVGeometry = new THREE.BoxGeometry(0.08, framePadding, 0.22)
                    const dividerV = new THREE.Mesh(dividerVGeometry, frameMaterial)
                    dividerV.position.x = 0
                    dividerV.position.z = 0.01
                    dividerV.castShadow = true
                    dividerV.receiveShadow = true
                    group.add(dividerV)

                    // Create canvas for title text
                    const canvas = document.createElement('canvas')
                    canvas.width = 512
                    canvas.height = 512
                    const context = canvas.getContext('2d')

                    if (context) {
                        // Clear background with slight transparency
                        context.fillStyle = 'rgba(255, 255, 255, 0.9)'
                        context.fillRect(0, 0, canvas.width, canvas.height)

                        // Draw title
                        context.font = 'bold 48px Arial'
                        context.textAlign = 'center'
                        context.textBaseline = 'middle'
                        context.fillStyle = '#000000'
                        context.fillText(title, canvas.width / 2, canvas.height / 2 - 30)

                        // Draw item count
                        context.font = '36px Arial'
                        context.fillStyle = '#444444'
                        const itemCount = items.length
                        context.fillText(
                            itemCount === 0 ? 'No items' :
                                itemCount === 1 ? '1 item' :
                                    `${itemCount} items`,
                            canvas.width / 2,
                            canvas.height / 2 + 40
                        )

                        // Draw help text
                        context.font = '28px Arial'
                        context.fillStyle = '#777777'
                        context.fillText(
                            'Click to view details',
                            canvas.width / 2,
                            canvas.height / 2 + 100
                        )
                    }

                    const texture = new THREE.CanvasTexture(canvas)
                    const labelMaterial = new THREE.MeshBasicMaterial({
                        map: texture,
                        transparent: true,
                        opacity: 0.95,
                        side: THREE.DoubleSide
                    })

                    const labelGeometry = new THREE.PlaneGeometry(1.8, 1.8)
                    const label = new THREE.Mesh(labelGeometry, labelMaterial)
                    label.position.z = 0.2
                    label.userData = { interactive: true, key, title, items }
                    group.add(label)

                    scene.add(group)

                    // Store reference for animation
                    windowRefs.current[key] = group

                    return group
                }

                // Create window quadrants with their items
                createWindow('openSelf', 'Open Self', [-1.2, 1.2, 0], '#4285f4', parsedData.openSelf)
                createWindow('blindSelf', 'Blind Self', [1.2, 1.2, 0], '#ea4335', parsedData.blindSelf)
                createWindow('hiddenSelf', 'Hidden Self', [-1.2, -1.2, 0], '#34a853', parsedData.hiddenSelf)
                createWindow('unknownSelf', 'Unknown Self', [1.2, -1.2, 0], '#fbbc05', parsedData.unknownSelf)

                // Create label maker function
                const createLabel = (text: string, position: THREE.Vector3, rotation: THREE.Euler | null = null) => {
                    const canvas = document.createElement('canvas')
                    canvas.width = 512
                    canvas.height = 128
                    const context = canvas.getContext('2d')

                    if (context) {
                        context.fillStyle = 'rgba(245, 245, 245, 0.9)'
                        context.fillRect(0, 0, canvas.width, canvas.height)
                        context.font = 'bold 32px Arial'
                        context.textAlign = 'center'
                        context.textBaseline = 'middle'
                        context.fillStyle = '#333333'
                        context.fillText(text, canvas.width / 2, canvas.height / 2)
                    }

                    const texture = new THREE.CanvasTexture(canvas)
                    const material = new THREE.MeshBasicMaterial({
                        map: texture,
                        transparent: true,
                        side: THREE.DoubleSide
                    })

                    const labelSize = isMobile ? 2.5 : 3
                    const geometry = new THREE.PlaneGeometry(labelSize, labelSize * 0.25)
                    const mesh = new THREE.Mesh(geometry, material)

                    mesh.position.copy(position)
                    if (rotation) mesh.rotation.copy(rotation)

                    scene.add(mesh)
                }

                // Add labels for axes - adjust positions for mobile
                const labelOffset = isMobile ? 2.5 : 3
                createLabel('Known to Self', new THREE.Vector3(0, labelOffset, 0))
                createLabel('Unknown to Self', new THREE.Vector3(0, -labelOffset, 0))
                createLabel('Known to Others', new THREE.Vector3(-labelOffset, 0, 0), new THREE.Euler(0, 0, Math.PI / 2))
                createLabel('Unknown to Others', new THREE.Vector3(labelOffset, 0, 0), new THREE.Euler(0, 0, Math.PI / 2))

                // Add dividing lines
                const lineColor = 0x444444
                const lineWidth = isMobile ? 3 : 2

                const lineMaterial = new THREE.LineBasicMaterial({
                    color: lineColor,
                    linewidth: lineWidth
                })

                // Horizontal line
                const horizontalPoints = []
                horizontalPoints.push(new THREE.Vector3(-labelOffset, 0, 0))
                horizontalPoints.push(new THREE.Vector3(labelOffset, 0, 0))
                const horizontalGeometry = new THREE.BufferGeometry().setFromPoints(horizontalPoints)
                const horizontalLine = new THREE.Line(horizontalGeometry, lineMaterial)
                scene.add(horizontalLine)

                // Vertical line
                const verticalPoints = []
                verticalPoints.push(new THREE.Vector3(0, -labelOffset, 0))
                verticalPoints.push(new THREE.Vector3(0, labelOffset, 0))
                const verticalGeometry = new THREE.BufferGeometry().setFromPoints(verticalPoints)
                const verticalLine = new THREE.Line(verticalGeometry, lineMaterial)
                scene.add(verticalLine)

                // Add a simple grid for better depth perception
                const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc)
                gridHelper.position.y = -3
                scene.add(gridHelper)

                // Setup raycaster for mouse interaction
                const raycaster = new THREE.Raycaster()
                const mouse = new THREE.Vector2()

                // Handle click events
                const handleClick = (event: MouseEvent) => {
                    // Only process clicks if component is active
                    if (!isActive || !rendererRef.current || !cameraRef.current || !sceneRef.current) return

                    // Calculate mouse position in normalized device coordinates
                    const rect = rendererRef.current.domElement.getBoundingClientRect()
                    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
                    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

                    // Update the picking ray
                    raycaster.setFromCamera(mouse, cameraRef.current)

                    // Find intersections
                    const intersects = raycaster.intersectObjects(sceneRef.current.children, true)

                    // Check if we clicked on a window
                    for (let i = 0; i < intersects.length; i++) {
                        const object = intersects[i].object

                        // Check if clicked object or its parent is a Johari window
                        if (object.userData?.interactive ||
                            (object.parent && object.parent.userData?.isJohariWindow)) {

                            // Get the data from the object or its parent
                            const data = object.userData?.interactive ? object.userData : object.parent?.userData

                            if (data && data.key) {
                                // Set the selected quadrant and its data
                                setSelectedQuadrant(data.key)
                                setQuadrantTitle(data.title)
                                setQuadrantItems(data.items)
                                return
                            }
                        }
                    }
                }

                // Only add event listener if we successfully created the renderer
                renderer.domElement.addEventListener('click', handleClick)

                // Animation loop
                const animate = () => {
                    if (!isActive || !sceneRef.current || !rendererRef.current || !cameraRef.current) return

                    frameIdRef.current = requestAnimationFrame(animate)

                    // Update controls
                    if (controlsRef.current) controlsRef.current.update()

                    // Animate windows
                    const time = Date.now() * 0.0005
                    const amplitude = 0.03

                    Object.entries(windowRefs.current).forEach(([key, window], index) => {
                        // Get original position
                        const baseY = key.includes('Self') && key.includes('open') || key.includes('blind') ? 1.2 : -1.2

                        // Apply gentle floating animation
                        window.position.y = baseY + Math.sin(time + index * 1.5) * amplitude
                    })

                    // Render scene
                    renderer.render(scene, camera)
                }

                // Start animation
                animate()

                // Return cleanup function for this specific initialization
                return () => {
                    // Remove event listener
                    if (renderer && renderer.domElement) {
                        renderer.domElement.removeEventListener('click', handleClick)
                    }
                }

            } catch (error) {
                console.error("Error initializing Three.js scene:", error)
                cleanup() // Ensure resources are cleaned up on error
                threejsInitializedRef.current = false
            }
        }

        // Initialize the scene
        const cleanupSpecificInit = initializeScene()

        // Handle window resize with debounce
        let resizeTimeout: NodeJS.Timeout | null = null
        const handleResize = () => {
            if (resizeTimeout) clearTimeout(resizeTimeout)

            resizeTimeout = setTimeout(() => {
                if (!containerRef.current || !cameraRef.current || !rendererRef.current) return

                const width = containerRef.current.clientWidth
                const height = containerRef.current.clientHeight

                cameraRef.current.aspect = width / height
                cameraRef.current.updateProjectionMatrix()

                rendererRef.current.setSize(width, height)
            }, 100) // Debounce resize events
        }

        window.addEventListener('resize', handleResize)

        // Clean up on unmount
        return () => {
            isActive = false // Mark component as inactive

            if (resizeTimeout) clearTimeout(resizeTimeout)
            window.removeEventListener('resize', handleResize)

            // Call specific cleanup from this initialization if it exists
            if (typeof cleanupSpecificInit === 'function') {
                cleanupSpecificInit()
            }

            // Call the general cleanup function
            cleanup()
        }
    }, [johariData, isMobile, parsedData.blindSelf, parsedData.hiddenSelf, parsedData.openSelf, parsedData.unknownSelf])

    // Effect to handle updates to johariData
    useEffect(() => {
        // Re-initialize if already initialized and data changed
        if (threejsInitializedRef.current) {
            // Reset initialization flag to force re-creation
            threejsInitializedRef.current = false
        }
    }, [johariData])

    // Reset camera position
    const resetCamera = () => {
        if (cameraRef.current && controlsRef.current) {
            // Animation parameters
            const duration = 1000 // ms
            const startTime = Date.now()
            const startPosition = cameraRef.current.position.clone()
            const targetPosition = new THREE.Vector3(0, 0, isMobile ? 6 : 5)

            // Animation function
            const animateReset = () => {
                const elapsedTime = Date.now() - startTime
                const progress = Math.min(elapsedTime / duration, 1)

                // Ease function (cubic ease-out)
                const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
                const easedProgress = easeOutCubic(progress)

                // Interpolate camera position
                cameraRef.current!.position.lerpVectors(
                    startPosition,
                    targetPosition,
                    easedProgress
                )

                // Continue animation if not complete
                if (progress < 1) {
                    requestAnimationFrame(animateReset)
                } else {
                    // Reset controls target
                    controlsRef.current!.target.set(0, 0, 0)
                    controlsRef.current!.update()
                }
            }

            // Start animation
            animateReset()
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h3 className="text-xl font-medium">Johari Window 3D Visualization</h3>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={resetCamera}
                        title="Reset view"
                    >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Reset View</span>
                    </Button>
                </div>
            </div>

            <div
                className="relative flex-1 min-h-[350px] md:min-h-[500px] bg-slate-50 dark:bg-zinc-900 rounded-md overflow-hidden border"
                ref={containerRef}
            >
                {/* Touch instructions for mobile */}
                {isMobile && (
                    <div className="absolute top-2 left-2 right-2 z-10 bg-black/50 text-white text-xs px-3 py-2 rounded-md backdrop-blur-sm pointer-events-none">
                        <div className="flex items-center justify-center gap-2">
                            <MoveHorizontal className="h-3 w-3" />
                            <span>Drag to rotate</span>
                            <Maximize className="h-3 w-3" />
                            <span>Pinch to zoom</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Quadrant details modal */}
            {selectedQuadrant && (
                <div
                    className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedQuadrant(null)}
                >
                    <Card
                        className="w-full max-w-md max-h-[80vh] shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle>{quadrantTitle}</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedQuadrant(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardDescription>
                                {quadrantTitle === 'Open Self' && 'Known to self and others'}
                                {quadrantTitle === 'Blind Self' && 'Unknown to self, known to others'}
                                {quadrantTitle === 'Hidden Self' && 'Known to self, unknown to others'}
                                {quadrantTitle === 'Unknown Self' && 'Unknown to self and others'}
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <ScrollArea className="max-h-[50vh]">
                                {quadrantItems.length === 0 ? (
                                    <p className="text-muted-foreground italic text-sm">
                                        No items have been added to this quadrant yet.
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {quadrantItems.map((item, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="py-1 px-3"
                                            >
                                                {item}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>

                        <CardFooter className="flex justify-end pt-2">
                            <Button
                                variant="default"
                                onClick={() => setSelectedQuadrant(null)}
                            >
                                Close
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* Quadrant color legend */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                <div className="flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-[#4285f4] mr-2"></div>
                    <span>Open Self</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-[#ea4335] mr-2"></div>
                    <span>Blind Self</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-[#34a853] mr-2"></div>
                    <span>Hidden Self</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-[#fbbc05] mr-2"></div>
                    <span>Unknown Self</span>
                </div>
            </div>
        </div>
    )
}