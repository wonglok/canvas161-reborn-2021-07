import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { InteractionUI } from "../vfx-library/InteractionUI";
import { getGPUTier } from "detect-gpu";
import { CState } from "./CState";
import { HDRI } from "../vfx-library/HDRI";
import { UIControls } from "./UIControls";
import { Text } from "@react-three/drei";
import {
  BoxBufferGeometry,
  BoxHelper,
  Color,
  Mesh,
  SphereGeometry,
} from "three";
import { CircleBufferGeometry } from "three";
// import { LoginChecker } from "./LoginChecker";
import { OLSlot } from "./OLSlot";
import { useAutoEvent } from "../vfx-others/ENUitls";
import { getFire, toArray } from "../vfx-others/ENFire";
import router from "next/router";
import { MeshBasicMaterial } from "three";

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

  CState.useReactiveKey("gameMode", () => {
    window.dispatchEvent(new Event("resize"));
  });

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
      style={
        CState.gameMode === "editor"
          ? {
              width: `calc(100% - 275px)`,
            }
          : {
              width: `calc(100% - 0px)`,
            }
      }
    >
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
        {CState.gameMode === "map" && (
          <group>
            <GridContent></GridContent>
          </group>
        )}
        {CState.gameMode === "editor" && <Editor></Editor>}

        <UIControls></UIControls>
      </Canvas>
    </div>
  );
}

function Editor() {
  let ref = useRef();
  useEffect(() => {
    if (ref.current) {
      const myGeo = new BoxBufferGeometry(10, 10, 10);
      myGeo.translate(0, 5, 0);
      const object = new Mesh(myGeo, new MeshBasicMaterial(0xff0000));
      const box = new BoxHelper(object, 0x000000);
      ref.current.add(box);
      return () => {
        if (ref.current) {
          ref.current.remove(box);
        }
      };
    }
  }, []);

  let [value, setValue] = useState(false);

  useEffect(() => {
    //

    return getFire()
      .database()
      .ref(`/maps/${CState.currentMapID}/slotData/${CState.currentSlotID}`)
      .on("value", (snap) => {
        //

        if (snap) {
          let val = snap.val();
          if (val) {
            setValue(val);
            console.log(val);
          }
        }
      });
  }, []);

  return (
    <group ref={ref}>
      {/* <mesh>
        <meshStandardMaterial color={"#ff0000"}></meshStandardMaterial>
        <sphereBufferGeometry args={[5, 32, 32]}></sphereBufferGeometry>
      </mesh> */}
      {value && <Slot resetToOrigin={true} value={value}></Slot>}
    </group>
  );
}

function Slot({ value, resetToOrigin = false, onClickSlot = () => {} }) {
  CState.makeKeyReactive("taken");

  let downColor = new Color("#bababa");
  let hoverColor = new Color("#888888");
  let readyColor = new Color(value.owner?.color || "#ffffff");
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
            document.body.style.cursor = `pointer`;
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

            if (CState.movement <= 20 && CState.isDown) {
              onClickSlot({ ...ev, value });
            }
            CState.movement = 0;
            CState.isDown = false;
          }}
          onPointerMove={() => {
            CState.movement++;
          }}
          onClick={(ev) => {
            onClickSlot({ ...ev, value });

            // ev.object.material.color = downColor;
            // setTimeout(() => {
            //   ev.object.material.color = hoverColor;
            // }, 100);
          }}
        >
          <meshStandardMaterial
            roughness={0.8}
            metalness={1}
            color={value?.owner?.color || "#ffffff"}
          ></meshStandardMaterial>
          <planeBufferGeometry args={[10, 10]}></planeBufferGeometry>
        </mesh>

        {/*  */}
        <Text position-y={1} rotation-x={Math.PI * -0.25} fontSize={1}>
          {/* {value._id} */}
          {value.owner ? value?.owner?.userDisplayName || "" : value?._id || ""}
        </Text>
      </group>
    </>
  );
}

function GridContent() {
  CState.makeKeyReactive("slotData");
  CState.makeKeyReactive("taken");

  useEffect(() => {
    getFire()
      .database()
      .ref(`/maps/${CState.currentMapID}/mapData`)
      .once("value", (snap) => {
        let v = snap.val();
        if (v) {
          CState.mapData = v;
          console.log(v);
        }
      });

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

    let cleanTakenData = getFire()
      .database()
      .ref(`/maps/${CState.currentMapID}/taken`)
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
                CState.currentSlotID = ev.value._id;
                CState.overlay = "slot";

                //
              }}
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

      {/*  */}
    </>
  );
}

function HTMLContent() {
  //
  CState.makeKeyReactive("overlay");
  CState.makeKeyReactive("slotData");
  CState.makeKeyReactive("taken");
  CState.makeKeyReactive("gameMode");

  useAutoEvent("keydown", (ev) => {
    if (ev.key.toLowerCase() === "escape") {
      CState.overlay = "ready";
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
          <div
            className="absolute top-0 left-0 h-full bg-gray-300"
            style={{ width: `275px` }}
          >
            <br />
            <br />
            <div className="ml-3">Side Bar Stuff</div>
            <div className="ml-3"></div>
          </div>
        </>
      )}

      {CState.gameMode === "editor" && (
        <>
          <div className="absolute top-0 left-0 m-3 ">
            <svg
              width="24"
              height="24"
              xmlns="http://www.w3.org/2000/svg"
              fillRule="evenodd"
              clipRule="evenodd"
              className="cursor-pointer"
              onClick={() => {
                //
                CState.viewMode = "roomView";
                CState.gameMode = "map";
              }}
            >
              <path d="M2.117 12l7.527 6.235-.644.765-9-7.521 9-7.479.645.764-7.529 6.236h21.884v1h-21.883z" />
            </svg>
          </div>
        </>
      )}

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
