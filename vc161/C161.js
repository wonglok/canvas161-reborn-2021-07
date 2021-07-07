import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { InteractionUI } from "../vfx-library/InteractionUI";
import { getGPUTier } from "detect-gpu";
import { CState } from "./CState";
import { HDRI } from "../vfx-library/HDRI";
import { UIControls } from "./UIControls";
import { Text } from "@react-three/drei";
import { Color } from "three";
import { CircleBufferGeometry } from "three";
import { LoginChecker } from "./LoginChecker";
import { OLSlot } from "./OLSlot";
import { useAutoEvent } from "../vfx-others/ENUitls";
import { getFire, toArray } from "../vfx-others/ENFire";

export function C161() {
  return (
    <div className="h-full w-full relative">
      <WebGLCanvas></WebGLCanvas>
      <HTMLContent></HTMLContent>
    </div>
  );
}

function WebGLCanvas() {
  let ref = useRef();
  let [dpr, setDPR] = useState([1, 3]);

  //
  useEffect(() => {
    return InteractionUI.fixTouchScreen({ target: ref.current });
  }, []);

  return (
    <div ref={ref} className="h-full w-full absolute top-0 left-0">
      <Canvas
        dpr={dpr}
        onCreated={({ gl }) => {
          getGPUTier({ glContext: gl.getContext() }).then((v) => {
            // ipad
            if (v.gpu === "apple a9x gpu") {
              setDPR([1, 1]);
              return;
            }
            if (v.fps < 30) {
              setDPR([1, 1]);
              return;
            }

            //

            if (v.tier >= 3) {
              setDPR([1, 3]);
            } else if (v.tier >= 2) {
              setDPR([1, 2]);
            } else if (v.tier >= 1) {
              setDPR([1, 1]);
            } else if (v.tier < 1) {
              setDPR([1, 0.75]);
            }
          });
        }}
      >
        <HDRI></HDRI>
        <WebGLContent></WebGLContent>
      </Canvas>
    </div>
  );
}

function Slot({ geometry, taken, value, onClickSlot = () => {} }) {
  //
  CState.makeKeyReactive("taken");

  let downColor = new Color("#bababa");
  let hoverColor = new Color("#888888");
  let readyColor = new Color(value.owner?.color || "#ffffff");
  let radius = 10;
  let count = 0;
  let isDown = false;

  useAutoEvent("touchmove", () => {
    if (isDown) {
      count++;
    }
  });
  useAutoEvent("mousemove", () => {
    if (isDown) {
      count++;
    }
  });
  return (
    <>
      <group
        position-x={value.x * radius - value.width * 0.5 * radius}
        position-z={value.y * radius - value.height * 0.5 * radius}
      >
        <mesh
          scale={0.95}
          rotation-x={Math.PI * -0.5}
          onPointerEnter={(ev) => {
            document.body.style.cursor = `pointer`;
            ev.object.material.color = hoverColor;
          }}
          onPointerLeave={(ev) => {
            document.body.style.cursor = ``;
            ev.object.material.color = readyColor;
          }}
          onPointerDown={(ev) => {
            isDown = true;
            ev.object.material.color = downColor;
          }}
          onPointerUp={(ev) => {
            isDown = false;
            ev.object.material.color = readyColor;

            if (count <= 10) {
              onClickSlot({ ...ev, value });
            }
            count = 0;
          }}
          onClick={(ev) => {
            ev.object.material.color = downColor;

            setTimeout(() => {
              ev.object.material.color = hoverColor;
            }, 100);
          }}
          geometry={geometry}
        >
          <meshStandardMaterial
            roughness={0.8}
            metalness={1}
            color={value.owner?.color || "#ffffff"}
          ></meshStandardMaterial>
        </mesh>

        {/*  */}
        <Text position-y={1} rotation-x={Math.PI * -0.25} fontSize={1}>
          {value._id}
        </Text>
      </group>
    </>
  );
}

function WebGLContent() {
  const myGeometry = new CircleBufferGeometry(5, 32);

  CState.makeKeyReactive("slotData");

  let firstMapID = `C161LandingMap`;

  useEffect(() => {
    getFire()
      .database()
      .ref(`/maps/${firstMapID}/mapData`)
      .once("value", (snap) => {
        let v = snap.val();
        if (v) {
          CState.mapData = v;
          console.log(v);
        }
      });

    let cleanSlotData = getFire()
      .database()
      .ref(`/maps/${firstMapID}/slotData`)
      .on("value", (snap) => {
        if (snap) {
          let v = snap.val();
          if (v) {
            CState.slotData = toArray(v);
          } else {
            CState.slotData = [];
          }
        }
      });

    let cleanTakenData = getFire()
      .database()
      .ref(`/maps/${firstMapID}/taken`)
      .on("value", (snap) => {
        if (snap) {
          let v = snap.val();
          if (v) {
            CState.taken = toArray(v);
          } else {
            CState.taken = [];
          }
        }
      });

    return () => {
      cleanSlotData();
      cleanTakenData();
    };
  }, []);

  // let CountY = 24;
  // let CountX = 24;
  // 30x30

  return (
    <>
      {CState.slotData.map((i) => {
        return (
          <group key={i.key}>
            <Slot
              value={i.value}
              onClickSlot={(ev) => {
                //
                //
                CState.currentMapID = firstMapID;
                CState.currentSlotID = ev.value._id;
                CState.overlay = "slot";

                //
              }}
              geometry={myGeometry}
            ></Slot>
          </group>
        );
      })}

      {/* Grid Helper */}
      {/* <gridHelper
        raycast={() => {}}
        position-y={-0.05}
        args={[1000, 100, "#333333", "#333333"]}
      ></gridHelper> */}

      {/* UI Controls */}
      <UIControls></UIControls>

      {/*  */}
    </>
  );
}

function HTMLContent() {
  //
  CState.makeKeyReactive("overlay");

  useAutoEvent("keydown", (ev) => {
    if (ev.key.toLowerCase() === "escape") {
      CState.overlay = "ready";
    }
  });

  //
  return (
    <>
      {CState.overlay === "slot" && (
        <>
          <div className="h-full w-full absolute top-0 left-0">
            <LoginChecker>
              <OLSlot></OLSlot>
            </LoginChecker>
          </div>
          <div
            style={{ height: "56px" }}
            className="absolute top-0 right-0 mr-4 flex justify-center items-center"
          >
            <svg
              onClick={() => {
                CState.overlay = "ready";
              }}
              className=" cursor-pointer"
              width="24"
              height="24"
              xmlns="http://www.w3.org/2000/svg"
              fillRule="evenodd"
              clipRule="evenodd"
            >
              <path d="M12 11.293l10.293-10.293.707.707-10.293 10.293 10.293 10.293-.707.707-10.293-10.293-10.293 10.293-.707-.707 10.293-10.293-10.293-10.293.707-.707 10.293 10.293z" />
            </svg>
          </div>
        </>
      )}
    </>
  );
}