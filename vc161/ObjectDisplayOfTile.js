import { Detailed, Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Scene, sRGBEncoding } from "three";
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
        args={[aroundWidth, levelHeight, levelHeight, 2, 2, 2]}
      ></boxBufferGeometry>
    ),
    ball: (
      <boxBufferGeometry
        args={[aroundWidth, levelHeight, levelHeight, 2, 2, 2]}
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
                  onClicker({ ...ev, value, buildingKey: e.key });
                }}
                value={value}
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
function Blocker({ kv, value, geometries, onClicker }) {
  CState.makeKeyReactive("refreshBuilding");

  //
  let { scene } = useThree();
  let isDown = false;

  let refBlocker = useRef();
  let materials = {
    //
    default: (
      <meshPhongMaterial
        color={"#ffffff"}
        transparent={true}
        metalness={1}
        roughness={0.3}
      ></meshPhongMaterial>
    ),
  };

  useEffect(() => {
    let item = refBlocker.current;
    if (item) {
      if (kv?.value?.wallTexture) {
        item.material.map = new TextureLoader().load(
          `${kv.value.wallTexture}`,
          (tex) => {
            tex.encoding = sRGBEncoding;
          },
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
        if (CState.refreshBuilding) {
          if (item.material.map?.image?.src === kv.value.wallTexture) {
            return;
          }

          item.material.map = new TextureLoader().load(
            `${kv.value.wallTexture}`,
            (tex) => {
              tex.encoding = sRGBEncoding;
            },
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
  }, [CState.refreshBuilding, value]);

  return (
    <mesh
      ref={refBlocker}
      onPointerDown={() => {
        isDown = true;
      }}
      onPointerEnter={() => {
        if (CState.gameMode === "editor") {
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerLeave={() => {
        if (CState.gameMode === "editor") {
          document.body.style.cursor = "";
        }
      }}
      //
      onPointerUp={(ev) => {
        if (CState.gameMode === "editor") {
          if (CState.movement <= 10 && isDown) {
            onClicker(ev);
          }
        }
      }}
    >
      {materials[kv?.value?.material] || materials.default}
      {geometries[kv?.value?.geometry] || materials.box}
    </mesh>
  );
}

//
