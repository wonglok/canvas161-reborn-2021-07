import { Detailed, Text } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Mesh, TextureLoader } from "three";
import { toArray } from "../vfx-others/ENFire";
import { CState } from "./CState";

export function ObjectDisplayOfTile({ value, onClicker = () => {} }) {
  let buildingObj = value?.owner?.buildings || {};

  let buildings = toArray(buildingObj);

  let aroundWidth = 4.5;
  let levelHeight = aroundWidth / 1.1618;
  let geometries = {
    //
    box: (
      <boxBufferGeometry
        args={[aroundWidth, levelHeight, aroundWidth, 2, 2, 2]}
      ></boxBufferGeometry>
    ),
    ball: (
      <boxBufferGeometry
        args={[aroundWidth, levelHeight, aroundWidth, 2, 2, 2]}
      ></boxBufferGeometry>
    ),
  };

  return (
    <group>
      <Detailed distances={[0, 80]}>
        <Text
          position-y={1}
          position-z={4}
          rotation-x={Math.PI * -0.25}
          fontSize={1}
        >
          {/* {value._id} */}
          {value.owner
            ? value?.owner?.buildingText || value?.owner?.userDisplayName
            : value?._id || ""}
        </Text>
        <group>{/* placeholder to hide item */}</group>
      </Detailed>

      {buildings.map((e, i) => {
        return (
          <group
            key={e.key}
            position-y={levelHeight * 0.5 + (levelHeight + 0.1) * i}
          >
            <Suspense fallback={null}>
              <Blocker
                onClicker={(ev) => {
                  onClicker({ ...ev, value });
                }}
                geometries={geometries}
                kv={e}
              ></Blocker>
            </Suspense>
          </group>
        );
      })}
    </group>
  );
}
function Blocker({ kv, geometries, onClicker }) {
  CState.makeKeyReactive("refreshBuilding");

  //
  let isDown = false;

  let refBlocker = useRef();
  let materials = {
    //
    default: (
      <meshStandardMaterial
        metalness={0.5}
        roughness={1}
        color={"#ffffff"}
      ></meshStandardMaterial>
    ),
  };

  useEffect(() => {
    let item = refBlocker.current;
    if (item) {
      if (kv?.value?.wallTexture) {
        item.material.map = new TextureLoader().load(
          `${kv.value.wallTexture}`,
          () => {},
          () => {},
          () => {
            // /texture/white128.jpg
            item.material.map = new TextureLoader().load(
              `/texture/placeholder.png`
            );
          }
        );
      }
    }
  }, [JSON.stringify(kv)]);

  useEffect(() => {
    let item = refBlocker.current;
    if (item) {
      if (kv?.value?.wallTexture) {
        if (CState.refreshBuilding === kv.key) {
          item.material.map = new TextureLoader().load(
            `${kv.value.wallTexture}`,
            () => {},
            () => {},
            () => {
              item.material.map = new TextureLoader().load(
                `/texture/placeholder.png`
              );
            }
          );
        }
      }
    }
  }, [CState.refreshBuilding]);

  return (
    <mesh
      ref={refBlocker}
      onPointerDown={() => {
        isDown = true;
      }}
      //
      onPointerUp={(ev) => {
        if (CState.movement <= 10 && isDown) {
          onClicker(ev);
        }
      }}
    >
      {materials[kv?.value?.material] || materials.default}
      {geometries[kv?.value?.geometry] || materials.box}
    </mesh>
  );
}

//
