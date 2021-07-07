import router from "next/router";
import { useEffect, useState } from "react";
import { getFire, loginGoogle } from "../vfx-others/ENFire";
import { CState, obtainSlot } from "./CState";
export function OLSlot() {
  let [reload, reloader] = useState(0);
  let hasData = CState.slotData.find((e) => e.key === CState.currentSlotID);

  return (
    <>
      {!hasData && (
        <div className="bg-white bg-opacity-95 h-full w-full">
          <div
            className="bg-purple-500 text-white flex items-center justify-center text-lg"
            style={{ height: "56px" }}
          >
            Slot Not Found
          </div>

          <div className="flex items-center mt-12 justify-center">
            Cant find this slot.
          </div>
        </div>
      )}
      {(hasData && CState.slotData.length > 0 && (
        <div className="bg-white bg-opacity-95 h-full w-full">
          <div
            className="bg-yellow-500 flex items-center justify-center text-lg"
            style={{ height: "56px" }}
          >
            Slot {CState.currentSlotID.split("_").join("-")}
          </div>

          {getFire().auth().currentUser && (
            <div
              className="ml-4 flex items-center absolute top-0 left-0"
              style={{ height: `56px` }}
              onClick={() => {
                getFire()
                  .auth()
                  .signOut()
                  .then(() => {
                    reloader((s) => s + 1);
                  });
              }}
            >
              Logout
            </div>
          )}

          <div>
            <SlotStatus></SlotStatus>
          </div>

          <div>
            <SlotDetailsDisplay></SlotDetailsDisplay>
          </div>
        </div>
      )) || (
        <div className="w-full h-full flex items-center justify-center">
          Welcome to Canvas161!
        </div>
      )}
    </>
  );
}

function SlotDetailsDisplay() {
  CState.makeKeyReactive("taken");
  CState.makeKeyReactive("reload");

  let slotData = CState.slotData.find((e) => e.key === CState.currentSlotID);

  return (
    <div>
      {/* Slot Data Details
      {/*  */}
      {/* <div>
        Share link:{" "}
        <a
          className="text-blue-500 underline"
          target="_blank"
          href={`https://canvas161.com/${CState.currentMapID}/${CState.currentSlotID}`}
        >
          https://canvas161.com/{CState.currentMapID}/{CState.currentSlotID}
        </a>
      </div>
      <pre>{JSON.stringify(slotData, null, "  ")}</pre> */}
    </div>
  );
}

function SlotStatus() {
  CState.makeKeyReactive("taken");
  CState.makeKeyReactive("reload");
  CState.makeKeyReactive("overlay");
  CState.makeKeyReactive("slotData");

  let [ownerData, setShow] = useState(false);
  let [isBoughtBy, setBoughtBy] = useState("none");
  let [user, setUser] = useState(false);
  useEffect(() => {
    getFire()
      .database()
      .ref(`/maps/${CState.currentMapID}/slotData/${CState.currentSlotID}`)
      .once("value", (snap) => {
        if (snap) {
          let usr = getFire().auth().currentUser;
          if (usr) {
            setUser(usr);
          } else {
            setUser(false);
          }

          let val = snap.val();
          if (val && val.owner) {
            if (val.owner.ownerUID === usr?.uid) {
              setBoughtBy("yourself");
            } else {
              setBoughtBy("others");
            }
          } else {
            setBoughtBy("none");
          }

          setShow(val);
        }
      });
  }, [CState.reload]);

  // let hasData = CState.slotData.find((e) => e.key === CState.currentSlotID);
  // let isBoughtBy = CState.taken.find((e) => e.key === CState.currentSlotID);

  return (
    <>
      {ownerData && (
        <div className="text-lg text-center p-3">
          {isBoughtBy === "yourself" && (
            <div>
              <div>
                Congratulations {user?.displayName}! You now own the Slot at [
                {CState.currentSlotID}].
              </div>

              <div>
                <button
                  onClick={() => {
                    //
                    CState.overlay = "";
                    CState.viewMode = "buildingView";
                    CState.gameMode = "editor";
                  }}
                  className="bg-indigo-500 px-6 my-3 py-3 text-white rounded-full shadow-md drop-shadow-lg "
                >
                  Edit My Land
                </button>
              </div>
            </div>
          )}
          {isBoughtBy === "others" && (
            <div>
              Slot [{CState.currentSlotID}] is owned by{" "}
              {ownerData?.owner?.userDisplayName || "others."}
            </div>
          )}
          {isBoughtBy === "none" && (
            <div>
              {user ? (
                <button
                  onClick={() => {
                    if (user) {
                      obtainSlot({
                        mapID: CState.currentMapID,
                        slotID: CState.currentSlotID,
                      }).then(() => {
                        CState.reload++;
                      });
                    }

                    //
                  }}
                  className="bg-green-500 px-6 my-3 py-3 text-white rounded-full shadow-md drop-shadow-lg "
                >
                  Own This Land
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!user) {
                      loginGoogle().then(() => {
                        CState.reload++;

                        obtainSlot({
                          mapID: CState.currentMapID,
                          slotID: CState.currentSlotID,
                        }).then(() => {
                          CState.reload++;
                        });
                      });
                    }

                    //
                  }}
                  className="bg-green-500 px-6 my-3 py-3 text-white rounded-full shadow-md drop-shadow-lg "
                >
                  Login and Own this Land
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {!ownerData && <div></div>}
    </>
  );
}

//
