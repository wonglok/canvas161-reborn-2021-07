import {
  MapControls,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Vector3 } from "three";
import { CState } from "./CState";

export function UIControls() {
  return (
    <>
      <>
        {CState.viewMode === "topView" && <TopView></TopView>}
        {CState.viewMode === "roomView" && <RoomView></RoomView>}
        {CState.viewMode === "orbitView" && <OribtView></OribtView>}
        {CState.viewMode === "buildingView" && <BuildingView></BuildingView>}
      </>
    </>
  );
}

let useCamRig = ({ viewMode, controls, camera }) => {
  CState.makeKeyReactive(viewMode);

  let isReady = useRef(false);
  let { scene } = useThree();
  useEffect(() => {
    return () => {
      scene.visible = false;
    };
  }, []);

  useFrame(() => {
    if (controls.current && isReady.current) {
      CState[viewMode].position.copy(controls.current.object.position);
      CState[viewMode].target.copy(controls.current.target);
      scene.visible = true;
    } else if (controls.current && !isReady.current) {
      controls.current.object.position.copy(CState[viewMode].position);
      controls.current.target.copy(CState[viewMode].target);
      isReady.current = true;
    }
  });
};

function RoomView() {
  let controls = useRef();
  let camera = useRef();
  useCamRig({ controls, camera, viewMode: "roomView" });

  return (
    <group>
      <PerspectiveCamera
        ref={camera}
        far={140}
        near={0.1}
        fov={45}
        makeDefault
      ></PerspectiveCamera>

      <MapControls
        ref={controls}
        enableRotate={false}
        panSpeed={1.5}
        dampingFactor={0.05}
        enabled={true}
        maxDistance={80}
        minDistance={30}
      ></MapControls>
    </group>
  );
}

function BuildingView() {
  let controls = useRef();
  let camera = useRef();

  useEffect(() => {
    CState.BuildingView = {
      target: new Vector3(),
      position: new Vector3(0, 25, 25),
    };
  }, []);
  useCamRig({ controls, camera, viewMode: "buildingView" });

  return (
    <group>
      <PerspectiveCamera
        ref={camera}
        far={500}
        near={0.1}
        fov={45}
        makeDefault
      ></PerspectiveCamera>
      {/* <MapControls
        ref={controls}
        enableRotate={false}
        panSpeed={1.5}
        dampingFactor={0.05}
        enabled={true}
        maxDistance={250}
        minDistance={30}
      ></MapControls> */}

      <OrbitControls
        ref={controls}
        dampingFactor={0.05}
        enabled={true}
        panSpeed={1.5}
      ></OrbitControls>
    </group>
  );
}

function OribtView() {
  let controls = useRef();
  let camera = useRef();
  useCamRig({ controls, camera, viewMode: "orbitView" });

  return (
    <group>
      <PerspectiveCamera
        ref={camera}
        far={140}
        near={0.1}
        fov={45}
        makeDefault
      ></PerspectiveCamera>
      <OrbitControls
        ref={controls}
        dampingFactor={0.05}
        enabled={true}
      ></OrbitControls>
    </group>
  );
}

function TopView() {
  let controls = useRef();
  let camera = useRef();
  useCamRig({ controls, camera, viewMode: "topView" });

  return (
    <group>
      <PerspectiveCamera
        ref={camera}
        far={140}
        near={0.1}
        fov={35}
        makeDefault
      ></PerspectiveCamera>
      <MapControls
        ref={controls}
        dampingFactor={0.05}
        enabled={true}
      ></MapControls>
    </group>
  );
}
