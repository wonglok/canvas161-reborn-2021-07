import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { InteractionUI } from "../vfx-library/InteractionUI";
import { getGPUTier } from "detect-gpu";
import { CState, onOpenTextureChooser } from "./CState";
import { HDRI } from "../vfx-library/HDRI";
import { UIControls } from "./UIControls";
// import { Text } from "@react-three/drei";
import {
  // BoxBufferGeometry,
  // BoxHelper,
  Color,
  // Mesh,
  // SphereGeometry,
} from "three";
import { ObjectDisplayOfTile } from "./ObjectDisplayOfTile";
// import { LoginChecker } from "./LoginChecker";
import { OLSlot } from "./OLSlot";
import { useAutoEvent } from "../vfx-others/ENUitls";
import { getFire, toArray } from "../vfx-others/ENFire";
import router from "next/router";
// import { MeshBasicMaterial } from "three";
import { HTMLSidebarEditor } from "./HTMLSidebarEditor";
// import { Detailed } from "@react-three/drei";
import { sRGBEncoding } from "three";

export function getPanelHeight() {
  let h = window.innerHeight * 0.25;
  if (h > 275) {
    h = 275;
  }
  return h;
}

//
export function C161({ mapID = "first-gen" }) {
  CState.currentMapID = mapID;
  // console.log(CState.currentMapID);

  return (
    <>
      {CState.currentMapID && (
        <div className="h-full w-full relative">
          <WebGLCanvas></WebGLCanvas>
          <HTMLContent></HTMLContent>
        </div>
      )}
    </>
  );
}

function WebGLCanvas() {
  CState.makeKeyReactive("viewMode");
  CState.makeKeyReactive("gameMode");

  // CState.useReactiveKey("gameMode", () => {
  //   window.dispatchEvent(new Event("resize"));
  // });

  let ref = useRef();
  let [dpr, setDPR] = useState([1, 3]);

  //
  useEffect(() => {
    return InteractionUI.fixTouchScreen({ target: ref.current });
  }, []);

  return (
    <div
      ref={ref}
      className={"h-full w-full absolute top-0 right-0 "}
      // style={
      //   CState.gameMode === "editor"
      //     ? {
      //         height: `calc(100% - ${0.0 * getPanelHeight()}px)`,
      //       }
      //     : {
      //         height: `calc(100% - 0px)`,
      //       }
      // }
    >
      <Canvas
        dpr={dpr}
        onCreated={({ gl }) => {
          gl.outputEncoding = sRGBEncoding;
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
        {/* <ambientLight intensity={0.5}></ambientLight> */}
        <ambientLight intensity={0.3}></ambientLight>
        <directionalLight
          position={[-100, 100, 100]}
          intensity={0.3}
        ></directionalLight>
        <pointLight position={[100, 100, 100]} intensity={0.3}></pointLight>

        {CState.gameMode === "map" && (
          <group visible={true}>
            <GridContent></GridContent>
          </group>
        )}
        {CState.gameMode === "editor" && <GLEditor></GLEditor>}

        <UIControls></UIControls>
      </Canvas>
    </div>
  );
}

function GLEditor() {
  let [value, setValue] = useState(false);

  useEffect(() => {
    let hh = (snap) => {
      if (snap) {
        let val = snap.val();
        if (val) {
          setValue(val);
        }
      }
    };
    let refPoint = getFire()
      .database()
      .ref(`/maps/${CState.currentMapID}/slotData/${CState.currentSlotID}`);

    refPoint.on("value", hh);
    return () => {
      refPoint.off("value", hh);
    };
  }, []);

  return (
    <group>
      {value && (
        <Slot
          onClickDuringEditMode={(ev) => {
            if (ev.buildingKey) {
              onOpenTextureChooser({ buildingKey: ev.buildingKey });
            }
          }}
          resetToOrigin={true}
          value={value}
        ></Slot>
      )}
    </group>
  );
}

function Slot({
  value,
  resetToOrigin = false,
  onClickDuringEditMode = () => {},
  onClickSlot = () => {},
}) {
  // CState.makeKeyReactive("taken");

  let downColor = new Color("#bababa");
  let hoverColor = new Color("#888888");
  let readyColor = new Color(value.owner?.color || "#cccccc");
  let radius = 10;

  useAutoEvent("touchmove", () => {
    if (CState.isDown) {
      CState.movement++;
    }
  });
  useAutoEvent("mousemove", () => {
    if (CState.isDown) {
      CState.movement++;
    }
  });

  let resetToOriginFactor = resetToOrigin ? 0.0 : 1.0;
  return (
    <>
      <group
        position-x={
          resetToOriginFactor * value.x * radius -
          resetToOriginFactor * value.width * 0.5 * radius
        }
        position-z={
          resetToOriginFactor * value.y * radius -
          resetToOriginFactor * value.height * 0.5 * radius
        }
      >
        <mesh
          scale={0.998}
          rotation-x={Math.PI * -0.5}
          onPointerEnter={(ev) => {
            if (CState.gameMode === "map") {
              document.body.style.cursor = `pointer`;
            }
            ev.object.material.color = hoverColor;
          }}
          onPointerLeave={(ev) => {
            document.body.style.cursor = ``;
            ev.object.material.color = readyColor;
          }}
          onPointerDown={(ev) => {
            CState.isDown = true;
            CState.movement = 0;
            ev.object.material.color = downColor;
          }}
          onPointerUp={(ev) => {
            ev.object.material.color = readyColor;

            if (
              CState.movement <= 20 &&
              CState.isDown &&
              CState.gameMode === "map"
            ) {
              onClickSlot({ ...ev, value });
            }
            CState.movement = 0;
            CState.isDown = false;
          }}
          onPointerMove={() => {
            CState.movement++;
          }}
          onClick={(ev) => {
            if (CState.gameMode === "map") {
              onClickSlot({ ...ev, value });
            }

            // ev.object.material.color = downColor;
            // setTimeout(() => {
            //   ev.object.material.color = hoverColor;
            // }, 100);
          }}
        >
          <meshPhongMaterial color={readyColor}></meshPhongMaterial>
          <planeBufferGeometry args={[10, 10]}></planeBufferGeometry>
        </mesh>
        <group></group>

        {
          <ObjectDisplayOfTile
            onClicker={(ev) => {
              onClickSlot(ev);

              if (CState.gameMode === "editor") {
                //
                //
                onClickDuringEditMode(ev);
              }
            }}
            value={value}
          ></ObjectDisplayOfTile>
        }
      </group>
    </>
  );
}

function GridContent() {
  CState.makeKeyReactive("slotData");
  // CState.makeKeyReactive("taken");

  useEffect(() => {
    // getFire()
    //   .database()
    //   .ref(`/maps/${CState.currentMapID}/mapData`)
    //   .once("value", (snap) => {
    //     let v = snap.val();
    //     if (v) {
    //       CState.mapData = v;
    //       console.log(v);
    //     }
    //   });

    let cleanSlotData = getFire()
      .database()
      .ref(`/maps/${CState.currentMapID}/slotData`)
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

    // let cleanTakenData = getFire()
    //   .database()
    //   .ref(`/maps/${CState.currentMapID}/taken`)
    //   .on("value", (snap) => {
    //     if (snap) {
    //       let v = snap.val();
    //       if (v) {
    //         CState.taken = toArray(v);
    //       } else {
    //         CState.taken = [];
    //       }
    //     }
    //   });

    return () => {
      cleanSlotData();
      // cleanTakenData();
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
                if (CState.gameMode === "map") {
                  CState.currentSlotID = ev.value._id;
                  CState.overlay = "slot";
                }
              }}
            ></Slot>
          </group>
        );
      })}
      {/*
      <mesh rotation-x={Math.PI * -0.5}>
        <meshBasicMaterial color={"#232323"}></meshBasicMaterial>
        <planeBufferGeometry args={[1000, 1000, 2, 2]}></planeBufferGeometry>
      </mesh> */}
      <gridHelper
        raycast={() => {}}
        position-y={-0.05}
        args={[1000, 100, "#333333", "#333333"]}
      ></gridHelper>

      {/* Grid Helper */}
      {/* <gridHelper
        raycast={() => {}}
        position-y={-0.05}
        args={[1000, 100, "#333333", "#333333"]}
      ></gridHelper> */}

      {/* UI Controls */}

      {/*  */}
    </>
  );
}

function HTMLContent() {
  //
  CState.makeKeyReactive("overlay");
  CState.makeKeyReactive("slotData");
  // CState.makeKeyReactive("taken");
  CState.makeKeyReactive("gameMode");

  CState.useReactiveKey("overlay", () => {
    if (CState.overlay) {
      CState.esc.push("overlay");
    }
  });
  CState.useReactiveKey("panel", () => {
    if (CState.panel) {
      CState.esc.push("panel");
    }
  });

  useAutoEvent("keydown", (ev) => {
    if (ev.key.toLowerCase() === "escape") {
      if (CState.esc[0] === "overlay") {
        CState.overlay = "";
        CState.esc.shift();
      }
      if (CState.esc[0] === "panel") {
        CState.panel = "";
        CState.esc.shift();
      }
    }
  });

  useEffect(() => {
    if (router.query.slotID && CState.slotData.length > 0) {
      CState.currentSlotID = router.query.slotID;
      CState.overlay = "slot";
    }
  }, [CState.slotData]);

  //
  return (
    <>
      {CState.gameMode === "editor" && (
        <>
          <HTMLSidebarEditor></HTMLSidebarEditor>
        </>
      )}

      {CState.gameMode === "editor" && <></>}

      {CState.overlay === "slot" && (
        <>
          <div className="h-full w-full absolute top-0 left-0">
            {CState.slotData.length > 0 && <OLSlot></OLSlot>}
            {/* <LoginChecker></LoginChecker> */}
          </div>
          <div
            style={{ height: "56px" }}
            className="absolute top-0 right-0 mr-4 flex justify-center items-center"
          >
            <svg
              onClick={() => {
                CState.overlay = "";
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
