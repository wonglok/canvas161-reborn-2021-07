import { Detailed, Text } from "@react-three/drei";
// import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { sRGBEncoding } from "three";
import { TextureLoader } from "three";
import { getFire, toArray } from "../vfx-others/ENFire";
import { CState } from "./CState";

export function ObjectDisplayOfTile({ value, onClicker = () => {} }) {
  let buildingObj = value?.owner?.buildings || {};

  let buildings = toArray(buildingObj);

  console.log(buildings);

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
            <Blocker
              onClicker={(ev) => {
                onClicker({ ...ev, value, buildingKey: e.key });
              }}
              geometries={geometries}
              // texture={}
              value={value}
              kv={e}
            ></Blocker>
          </group>
        );
      })}
    </group>
  );
}
function Blocker({ kv, value, geometries, onClicker }) {
  CState.makeKeyReactive("refreshBuilding");

  //
  let isDown = false;

  let refBlocker = useRef();
  let materials = {
    //
    default: (
      <meshPhongMaterial
        transparent={true}
        metalness={1}
        roughness={0.3}
        opacity={1}
      ></meshPhongMaterial>
    ),
  };

  useEffect(async () => {
    let refURL = kv?.value?.wallTexture;
    if (refURL) {
      let textureRef = getFire().storage().ref(refURL);
      textureRef.getDownloadURL().then((texture) => {
        new TextureLoader().load(
          texture,
          (tex) => {
            tex.encoding = sRGBEncoding;
            refBlocker.current.material.map = tex;
            refBlocker.current.material.needsUpdate = true;
          },
          () => {},
          () => {
            refBlocker.current.material.map = null;

            // new TextureLoader().load(
            //   `/texture/placeholder.png`,
            //   (tex) => {
            //     tex.encoding = sRGBEncoding;
            //     refBlocker.current.material.map = tex;
            //   },
            //   () => {},
            //   () => {
            //     refBlocker.current.material.map = null;
            //   }
            // );
          }
        );
      }); //
    }
  }, [value, CState.refreshBuilding]);

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
