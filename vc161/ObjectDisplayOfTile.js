import { useMemo } from "react";
import { Mesh } from "three";
import { toArray } from "../vfx-others/ENFire";
import { CState } from "./CState";

export function ObjectDisplayOfTile({ value, onClicker }) {
  let buildingObj = value?.owner?.buildings || {};

  let buildings = toArray(buildingObj);

  let materials = {
    //
    default: (
      <meshStandardMaterial
        metalness={0.8}
        roughness={0.1}
        color={"#ffffff"}
      ></meshStandardMaterial>
    ),
  };
  let geometries = {
    //
    box: <boxBufferGeometry args={[1, 1, 1, 2, 2, 2]}></boxBufferGeometry>,
    ball: <sphereBufferGeometry args={[0.5, 32, 32]}></sphereBufferGeometry>,
  };

  return (
    <group>
      {buildings.map((e, i) => {
        return (
          <group key={e.key} position-y={0.5 + 1 * i}>
            <Blocker
              onClicker={(ev) => {
                onClicker({ ...ev, value });
              }}
              materials={materials}
              geometries={geometries}
              kv={e}
            ></Blocker>
          </group>
        );
      })}
    </group>
  );
}
function Blocker({ kv, materials, geometries, onClicker }) {
  let isDown = false;
  return (
    <mesh
      onPointerDown={() => {
        isDown = true;
      }}
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
