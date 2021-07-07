import { useRouter } from "next/router";
import { C161 } from "../../vc161/C161";

export default function HomeLandingPage() {
  let router = useRouter();
  return <>{router.query.mapID && <C161 mapID={router.query.mapID}></C161>}</>;
}
