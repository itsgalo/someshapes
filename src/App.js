import React, { useRef, useState, useCallback, Suspense } from 'react'
import { Canvas, extend, useFrame, useThree, useLoader } from 'react-three-fiber'
import { Physics, usePlane, useBox } from 'use-cannon'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import uuid from "short-uuid"

import floorImg from './floor.jpg'
import floorBmp from './floorn.jpg'
import shape from './shape.gltf'
import orb from './orb.gltf'

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
  const [items, setItems] = useState([])
  //const [click, toggle] = useState(true)
  //setTimeout(() => set(items => [...items, uuid.generate()]), 1000)
  const handleClick = useCallback(e => {
    e.stopPropagation()
    //delta is difference from clicked point
    //console.log(e.delta)
    if (e.delta < 2){
      setItems(items => [...items, uuid.generate()])
    }
  }, [])
  const pos = useRef()

  return (
    <>
    <group
    onClick = {handleClick}
    onPointerMove={e => {
      e.stopPropagation()
      pos.current = [e.intersections[0].point.x, e.intersections[0].point.y+5, e.intersections[0].point.z]
    }}>
      <mesh>
        <planeGeometry attach="geometry" args={[50, 50]} />
        <meshBasicMaterial color='white' transparent opacity={0}/>
      </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
        <planeGeometry attach="geometry" args={[50, 50]} />
        <meshBasicMaterial color='white' transparent opacity={0}/>
      </mesh>
    </group>
    {items.map((key, index) => (
      index % 2 === 0 ? (<Orb key={key} position={pos.current} />)
      : (<Cube key={key} position={pos.current} />)
      ))}
    </>
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
        color={hovered ? '#'+Math.floor(Math.random()*16777215).toString(16): 'orange'}
       />
    </mesh>
    </>
  )
}

function Orb(props) {
  const gltf = useLoader(GLTFLoader, orb)

  const [ref, api] = useBox(() => ({
    mass: 1,
    args: [2, 2, 2],
    position: [0, 5, 0],
    rotation: [0, 0, 0],
     ...props
   }))
  const [hovered, setHover] = useState(false)

  useFrame(state => {
    if (hovered === true){
      api.applyForce([0, 10, 0], [-state.mouse.x, -state.mouse.y, 0])
    }
  })

  return (
    <>
    <mesh
      receiveShadow
      castShadow
      ref={ref}
      geometry = {gltf.nodes.Orb.geometry }
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <meshPhongMaterial
        attach="material"
        color={hovered ? '#'+Math.floor(Math.random()*16777215).toString(16): 'orange'}
       />
    </mesh>
    </>
  )
}

function Plane(props) {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0],...props}))
  const floor = useLoader(TextureLoader, floorImg)
  const floorB = useLoader(TextureLoader, floorBmp)

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry attach="geometry" args={[60, 60]} />
      <meshPhongMaterial attach="material" map={floor} bumpMap={floorB} color='white' />
    </mesh>
  )
}

export default function App() {
  const [show, toggleShow] = useState(true)
  const clearToys = (e) => {
    toggleShow(!show)
  }
  //setTimeout(() => toggle(!show), 1000)
  return (
  <>
    <div className='nav'>
      <div className='button'>
        <h1 onPointerDown={clearToys} onPointerUp={clearToys}>CLEAR</h1>
      </div>
    </div>
    <Canvas
    shadowMap gl={{ alpha: false }}
    orthographic camera={{ zoom: 50, position: [0, 100, 50]}}>
      <color attach="background" args={['purple']} />
      <CameraControls />
      <hemisphereLight intensity={0.25} />
      <spotLight position={[30, 30, 30]} angle={0.3} penumbra={1} intensity={1} castShadow />
      <Physics>
      <Suspense fallback={null}>
        {show && <Shapes />}
        <Plane />
        <Cube />
        </Suspense>
      </Physics>
    </Canvas>

    </>
  )
}
