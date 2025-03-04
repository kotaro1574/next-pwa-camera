import { RefObject, useEffect } from "react"
import { CameraType, Camera as ReactCameraPro } from "react-camera-pro"
import { FacingMode } from "react-camera-pro/dist/components/Camera/types"

type Props = {
  cameraRef: RefObject<CameraType>
  facingMode?: FacingMode
}

export default function Camera({
  cameraRef,
  facingMode = "environment",
}: Props) {
  // コンポーネントのマウント/アンマウント時の処理
  useEffect(() => {
    // マウント時の処理（必要に応じて）
    console.log("Camera component mounted with facingMode:", facingMode)

    // 現在のcameraRef値をキャプチャ
    const currentCameraRef = cameraRef.current

    // アンマウント時のクリーンアップ
    return () => {
      // ReactCameraProはHTMLVideoElementを内部で使用しているため、
      // DOMから直接アクセスして停止させる方法を試みる
      try {
        // キャプチャした値を使用
        if (currentCameraRef) {
          // CameraTypeが内部的に持っているかもしれないDOMノードを探す
          const videoElement = document.querySelector("video")
          if (videoElement && videoElement.srcObject) {
            const stream = videoElement.srcObject as MediaStream
            if (stream) {
              stream.getTracks().forEach((track) => track.stop())
              videoElement.srcObject = null
            }
          }
        }
        console.log("Camera component unmounted and resources cleaned up")
      } catch (error) {
        console.error(
          "カメラリソースのクリーンアップ中にエラーが発生しました:",
          error
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]) // cameraRefを依存配列から除外

  return (
    <div className="relative size-full overflow-hidden rounded-[24px]">
      <ReactCameraPro
        ref={cameraRef}
        facingMode={facingMode}
        aspectRatio="cover"
        errorMessages={{
          noCameraAccessible: "カメラが利用できません",
          permissionDenied: "カメラの使用が許可されていません",
          switchCamera: "カメラの切り替えはサポートされていません",
          canvas: "Canvas がサポートされていません",
        }}
      />
    </div>
  )
}
