import React, { useRef, useState, useCallback, Suspense } from 'react'
import { Canvas, extend, useFrame, useThree, useLoader } from 'react-three-fiber'
import { Physics, usePlane, useBox } from 'use-cannon'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import uuid from "short-uuid"

import './index.css'
import floorImg from './floor.jpg'
import floorBmp from './floorn.jpg'
import shape from './shape.gltf'

extend({ OrbitControls })

const CameraControls = () => {
  // We need these to setup the OrbitControls component.
  const {
    camera,
    gl: { domElement },
  } = useThree();
  // Ref to the controls, so that we can update them on every frame using useFrame
  const controls = useRef();
  useFrame((state) => controls.current.update());
  return (
    <orbitControls
      ref={controls}
      args={[camera, domElement]}
      enableZoom={false}
      enablePan={false}
      //enableRotate={false}
      maxPolarAngle={Math.PI / 3}
      minPolarAngle={Math.PI / 3}
    />
  )
}

function Shapes(props) {
  const [items, set] = useState([])
  //setTimeout(() => set(items => [...items, uuid.generate()]), 1000)
  const handleClick = useCallback(e => {
    e.stopPropagation()
    //delta is difference from clicked point
    //console.log(e.delta)
    if (e.delta < 2){
      set(items => [...items, uuid.generate()])
    }
  }, [])
  const pos = useRef()

  return (
    <>
    <mesh
    onClick = {handleClick}
    onPointerMove={e => {
      pos.current = [e.intersections[0].point.x, e.intersections[0].point.y + 5, e.intersections[0].point.z]
    }}
    >
    <planeGeometry attach="geometry" args={[50, 50]} />
    <meshBasicMaterial transparent opacity={0}/>
    </mesh>
    {items.map((key) => (
        <Cube key={key} position={pos.current} />
      ))}
    </>
  )
}

// function Shapes(props) {
//   return (
//     <Cube position={[4, 4, 0]}/>
//   )
// }

function Plane(props) {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0],...props}))

  const floor = useLoader(TextureLoader, floorImg)
  const floorB = useLoader(TextureLoader, floorBmp)

  return (
    <mesh
    ref={ref}
    receiveShadow
    //onClick = {handleClick}
    onPointerMove={e => {
      //pos.current = [e.intersections[0].point.x, e.intersections[0].point.y + 5, e.intersections[0].point.z]
    }}>
      <planeGeometry attach="geometry" args={[50, 50]} />
      <meshPhongMaterial attach="material" map={floor} bumpMap={floorB} color='white' />
    </mesh>
  )
}

function Cube(props) {
  const gltf = useLoader(GLTFLoader, shape)

  const [ref, api] = useBox(() => ({
    mass: 1,
    args: [2, 2, 2],
    position: [0, 5, 0],
    rotation: [0, 0, 0],
     ...props
   }))
  const [hovered, setHover] = useState(false)
  //const [active, setActive] = useState(false)

  useFrame(state => {
    if (hovered === true){
      api.applyForce([0, 10, 0], [-state.mouse.x, -state.mouse.y, 0])
      //console.log(gltf.nodes.Cube.geometry)
    }
  })

  return (
    <>
    <mesh
      receiveShadow
      castShadow
      ref={ref}
      geometry = {gltf.nodes.Cube.geometry}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <meshPhongMaterial
        attach="material"
        color={hovered ? '#'+(Math.random()*0xFFFFFF<<0).toString(16): 'orange'}
       />
    </mesh>
    </>
  )
}

export default function() {
  //const [show, toggle] = useState(true)
  //setTimeout(() => toggle(!show), 1000)
  return (
  <>
    <Canvas
    shadowMap gl={{ alpha: false }}
    orthographic camera={{ zoom: 50, position: [0, 100, 50]}}>
      <color attach="background" args={['purple']} />
      <CameraControls />
      <hemisphereLight intensity={0.25} />
      <spotLight position={[30, 30, 30]} angle={0.3} penumbra={1} intensity={1} castShadow />
      <Physics>
      <Suspense fallback={null}>
        <Shapes />
        <Plane />
        <Cube />
        </Suspense>
      </Physics>
    </Canvas>
    </>
  )
}
