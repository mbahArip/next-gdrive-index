import { TFile } from "types/googleapis";
import { drive_v3 } from "googleapis";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { get3DLoader } from "utils/mimeTypesHelper";
import { ReactNode, Suspense, useRef } from "react";
import { BufferGeometry } from "three";
import ErrorFeedback from "components/APIFeedback/Error";
import { OrbitControls, Stage } from "@react-three/drei";

type Props = {
  data: TFile | drive_v3.Schema$File;
};

export default function ModelPreview({ data }: Props) {
  const getLoader = get3DLoader(data.fileExtension as string);

  if (!getLoader) {
    return (
      <div className='flex w-full items-center justify-center'>
        <ErrorFeedback message={"Failed to load model"} />
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const loader = useLoader(
    getLoader,
    `${process.env.NEXT_PUBLIC_DOMAIN}/api/files/${data.id}/download`,
  );

  return (
    <div className='flex w-full items-center justify-center'>
      <div className={"aspect-video h-full w-full overflow-hidden rounded-lg"}>
        <Canvas
          shadows
          camera={{ position: [4, 0, -12], fov: 35 }}
        >
          <Suspense fallback={null}>
            <Scene>
              <Model model={loader as BufferGeometry} />
            </Scene>
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

type SceneProps = {
  children: ReactNode | JSX.Element;
};
function Scene({ children }: SceneProps): JSX.Element {
  const controlsRef = useRef<any>();

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <>
      <Stage
        intensity={1.5}
        environment='city'
        shadows={{
          type: "accumulative",
          color: "#b78135",
          colorBlend: 2,
          opacity: 2,
        }}
        adjustCamera={0.9}
      >
        {children}
      </Stage>
      <OrbitControls makeDefault />
    </>
  );
}

function Model({ model }: { model: BufferGeometry }): JSX.Element {
  return (
    <mesh
      geometry={model}
      castShadow={true}
      receiveShadow={true}
    >
      <meshStandardMaterial
        color={"#b78135"}
        roughness={0.5}
        metalness={0.5}
      />
    </mesh>
  );
}
