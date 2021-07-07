import { useEffect, useRef, useState } from "react";
import { getFire, toArray } from "../vfx-others/ENFire";
import { getID } from "../vfx-others/ENUitls";
import { getPanelHeight } from "./C161";
import { CState } from "./CState";

export function HTMLSidebarEditor() {
  CState.makeKeyReactive("panel");
  let [buildings, setBuildings] = useState([]);

  let getOwnerRef = () =>
    getFire()
      .database()
      .ref(
        `/maps/${CState.currentMapID}/slotData/${CState.currentSlotID}/owner`
      );
  useEffect(() => {
    return getOwnerRef().on("value", (snap) => {
      //
      if (snap) {
        let val = snap.val();
        if (val) {
          if (!val.buildings) {
            return getOwnerRef().child("buildings").set({});
          } else {
            setBuildings(toArray(val.buildings));
            return Promise.resolve();
          }
        } else {
          return Promise.resolve();
        }
      }
      return Promise.resolve();
    });
  }, []);

  return (
    <>
      <div
        className="absolute bottom-0 left-0 w-full bg-gray-300"
        style={{ height: `${getPanelHeight()}px` }}
      >
        <div
          className="bg-gray-400 absolute left-0 p-3 inline-flex items-center cursor-pointer"
          style={{
            top: `-47px`,
          }}
          onClick={() => {
            //
            CState.viewMode = "roomView";
            CState.gameMode = "map";
          }}
        >
          {/*  */}
          <svg
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            fillRule="evenodd"
            clipRule="evenodd"
          >
            {/*  */}
            <path d="M2.117 12l7.527 6.235-.644.765-9-7.521 9-7.479.645.764-7.529 6.236h21.884v1h-21.883z" />
          </svg>
          {/*  */}
          {/*  */}
          <div className="ml-3 inline-block">Back</div>
        </div>

        <div className="h-full w-full flex overflow-scroll-x ">
          <div className="h-full overflow-scroll w-52">
            <div>
              {buildings.length <= 10 && (
                <div
                  className="w-10 h-10 cursor-pointer inline-flex items-center justify-center hover:bg-white"
                  onClick={() => {
                    //
                    if (buildings.length <= 10) {
                      let item = getOwnerRef().child("buildings").push();

                      item.set({
                        type: "blocker",
                        draw: "mesh",
                        geometry: "box",
                        material: "default",
                        wallTexture: ``,
                      });
                    }
                  }}
                >
                  +
                </div>
              )}

              {buildings.map((e, i) => {
                return (
                  <div
                    key={e.key}
                    className="w-10 h-10 cursor-pointer inline-flex items-center justify-center hover:bg-white"
                    onClick={() => {
                      //
                      CState.onPickGallery = ({ data }) => {
                        //

                        getOwnerRef()
                          .child("buildings")
                          .child(e.key)
                          .child("wallTexture")
                          .set(data.itemURL)
                          .then(() => {
                            console.log("wallpaper set");
                            CState.refreshBuilding++;
                          });

                        //
                        // console.log(data);
                        //

                        //
                        //
                        //

                        CState.onPickGallery = () => {};
                        CState.panel = "";
                      };
                      CState.panel = "gallery";
                    }}
                  >
                    {i === 0 ? "G" : i} {/*  */}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* <pre className=" absolute top-0 right-0 h-full overflow-scroll">
        {JSON.stringify(buildings, null, "  ")}
      </pre> */}

      {CState.panel === `gallery` && (
        <Gallery onPick={CState.onPickGallery}></Gallery>
      )}
    </>
  );
}

function Gallery({ onPick = () => {} }) {
  return (
    <div
      className="absolute left-0 top-0 w-full overflow-scroll bg-yellow-100"
      style={{
        height: `calc(100% - ${getPanelHeight() - 2}px)`,
      }}
    >
      <div className="realative w-full h-12 flex justify-start items-center pl-3 text-lg">
        Gallery <div className="mx-3"> / </div>
        <UploadButton></UploadButton>
        {/*  */}
        <div className=" absolute top-0 right-0 m-3">
          <svg
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            fillRule="evenodd"
            clipRule="evenodd"
            onClick={() => {
              CState.panel = "";
            }}
          >
            <path d="M12 11.293l10.293-10.293.707.707-10.293 10.293 10.293 10.293-.707.707-10.293-10.293-10.293 10.293-.707-.707 10.293-10.293-10.293-10.293.707-.707 10.293 10.293z" />
          </svg>
        </div>
      </div>
      <div className="w-full border-b border-black"></div>
      <GalleryItems onPick={onPick}></GalleryItems>
    </div>
  );
}

function GalleryItems({ onPick = () => {} }) {
  //
  CState.makeKeyReactive("refreshGallery");

  let [gallery, setGallery] = useState([]);
  useEffect(() => {
    let uid = getFire().auth().currentUser?.uid;
    if (uid) {
      let fireRef = getFire().storage().ref(`/buildings/${uid}/`);
      fireRef.listAll().then((res) => {
        let allItems = res.items.map((itemRef) => {
          return new Promise(async (resolve) => {
            let itemURL = await itemRef.getDownloadURL();
            // let meta = await itemRef.getMetadata();

            resolve({ key: itemRef.name, itemURL });
          });
        });
        Promise.all(allItems).then((v) => {
          setGallery(v);
        });
      });
    }
  }, [CState.refreshGallery]);

  return (
    <div>
      {gallery.map((e) => {
        return (
          <GalleryOneItem key={e.key} data={e} onPick={onPick}></GalleryOneItem>
        );
      })}
    </div>
  );
}

function GalleryOneItem({ data = {}, onPick = () => {} }) {
  //

  return (
    <div
      onClick={() => {
        onPick({ data });
      }}
      className="inline-block hover:bg-yellow-300 cursor-pointer  p-2 m-2 "
    >
      <img className="h-32 w-32 object-contain" src={data.itemURL} />
    </div>
  );
}

function UploadButton() {
  let ref = useRef();
  return (
    <>
      <input className="hidden" ref={ref} type="file"></input>
      <button
        className="inline-block underline text-sm"
        onClick={() => {
          //
          ref.current.onchange = (ev) => {
            let files = ev.target.files;
            //
            let first = files[0];
            if (first) {
              //
              let uid = getFire().auth().currentUser?.uid;
              if (uid) {
                let fireRef = getFire().storage().ref(`/buildings/${uid}/`);
                fireRef
                  .child(getID())
                  .put(first)
                  .then((snap) => {
                    console.log("Uploaded a blob or file!");
                  });
              }
            }
          };
          ref.current.click();
        }}
      >
        Upload Texture
      </button>
    </>
  );
}
