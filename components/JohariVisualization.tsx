'use client'

import { useEffect, useRef } from 'react'
import { useJohari } from './JohariProvider'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'


export function JohariVisualization() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { johariData } = useJohari()

    useEffect(() => {
        if (!containerRef.current) return

        // Scene setup
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xf5f5f5)

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        )
        camera.position.z = 5

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
        containerRef.current.innerHTML = ''
        containerRef.current.appendChild(renderer.domElement)

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(1, 1, 1)
        scene.add(directionalLight)

        // Create the Johari Window 3D visualization
        const cubeSize = 2
        const spacing = 0.1
        const halfSize = cubeSize / 2

        // Function to calculate cube size based on content length
        const calculateSize = (text: string) => {
            const baseSize = 0.5
            const maxSize = 1.0
            const contentLength = text.length

            if (contentLength === 0) return baseSize
            return Math.min(baseSize + contentLength / 200, maxSize)
        }

        // Create cubes for each quadrant
        const openGeometry = new THREE.BoxGeometry(
            calculateSize(johariData.openSelf),
            calculateSize(johariData.openSelf),
            calculateSize(johariData.openSelf)
        )
        const openMaterial = new THREE.MeshStandardMaterial({ color: 0x4285f4, transparent: true, opacity: 0.8 })
        const openCube = new THREE.Mesh(openGeometry, openMaterial)
        openCube.position.set(-halfSize - spacing / 2, halfSize + spacing / 2, 0)
        scene.add(openCube)

        const blindGeometry = new THREE.BoxGeometry(
            calculateSize(johariData.blindSelf),
            calculateSize(johariData.blindSelf),
            calculateSize(johariData.blindSelf)
        )
        const blindMaterial = new THREE.MeshStandardMaterial({ color: 0xea4335, transparent: true, opacity: 0.8 })
        const blindCube = new THREE.Mesh(blindGeometry, blindMaterial)
        blindCube.position.set(halfSize + spacing / 2, halfSize + spacing / 2, 0)
        scene.add(blindCube)

        const hiddenGeometry = new THREE.BoxGeometry(
            calculateSize(johariData.hiddenSelf),
            calculateSize(johariData.hiddenSelf),
            calculateSize(johariData.hiddenSelf)
        )
        const hiddenMaterial = new THREE.MeshStandardMaterial({ color: 0x34a853, transparent: true, opacity: 0.8 })
        const hiddenCube = new THREE.Mesh(hiddenGeometry, hiddenMaterial)
        hiddenCube.position.set(-halfSize - spacing / 2, -halfSize - spacing / 2, 0)
        scene.add(hiddenCube)

        const unknownGeometry = new THREE.BoxGeometry(
            calculateSize(johariData.unknownSelf),
            calculateSize(johariData.unknownSelf),
            calculateSize(johariData.unknownSelf)
        )
        const unknownMaterial = new THREE.MeshStandardMaterial({ color: 0xfbbc05, transparent: true, opacity: 0.8 })
        const unknownCube = new THREE.Mesh(unknownGeometry, unknownMaterial)
        unknownCube.position.set(halfSize + spacing / 2, -halfSize - spacing / 2, 0)
        scene.add(unknownCube)

        // Add quadrant labels
        const createLabel = (text: string, position: THREE.Vector3) => {
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')
            canvas.width = 256
            canvas.height = 128

            if (context) {
                context.fillStyle = '#ffffff'
                context.fillRect(0, 0, canvas.width, canvas.height)
                context.fillStyle = '#000000'
                context.font = '24px Arial'
                context.textAlign = 'center'
                context.textBaseline = 'middle'
                context.fillText(text, canvas.width / 2, canvas.height / 2)
            }

            const texture = new THREE.CanvasTexture(canvas)
            const material = new THREE.SpriteMaterial({ map: texture })
            const sprite = new THREE.Sprite(material)
            sprite.position.copy(position)
            sprite.scale.set(1.5, 0.75, 1)
            scene.add(sprite)
        }

        createLabel('Open Self', new THREE.Vector3(-halfSize - spacing / 2, halfSize + spacing / 2, 1.5))
        createLabel('Blind Self', new THREE.Vector3(halfSize + spacing / 2, halfSize + spacing / 2, 1.5))
        createLabel('Hidden Self', new THREE.Vector3(-halfSize - spacing / 2, -halfSize - spacing / 2, 1.5))
        createLabel('Unknown Self', new THREE.Vector3(halfSize + spacing / 2, -halfSize - spacing / 2, 1.5))

        // Add grid for reference
        const gridHelper = new THREE.GridHelper(10, 10)
        gridHelper.position.y = -2
        scene.add(gridHelper)

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate)
            controls.update()

            // Gentle rotation
            openCube.rotation.y += 0.003
            blindCube.rotation.y += 0.003
            hiddenCube.rotation.y += 0.003
            unknownCube.rotation.y += 0.003

            renderer.render(scene, camera)
        }
        animate()

        // Handle window resize
        const handleResize = () => {
            if (!containerRef.current) return
            camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
            camera.updateProjectionMatrix()
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
        }

        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize)
            controls.dispose()
            renderer.dispose()
        }
    }, [johariData])

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-xl font-medium mb-4">Johari Window 3D Visualization</h3>
            <div className="flex-1 min-h-[400px] bg-zinc-100 dark:bg-zinc-900 rounded-md" ref={containerRef}></div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                    <div className="w-4 h-4 rounded-sm bg-[#4285f4] mr-2"></div>
                    <span>Open Self</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 rounded-sm bg-[#ea4335] mr-2"></div>
                    <span>Blind Self</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 rounded-sm bg-[#34a853] mr-2"></div>
                    <span>Hidden Self</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 rounded-sm bg-[#fbbc05] mr-2"></div>
                    <span>Unknown Self</span>
                </div>
            </div>
        </div>
    )
}