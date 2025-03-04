"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { CameraType } from "react-camera-pro"
import { FacingMode } from "react-camera-pro/dist/components/Camera/types"

import { Button } from "@/components/ui/button"
import Camera from "@/components/camera"

export default function IndexPage() {
  const cameraRef = useRef<CameraType>(null)
  const [facingMode, setFacingMode] = useState<FacingMode>("user")
  const [image, setImage] = useState<string | null>(null)
  const [isChangingCamera, setIsChangingCamera] = useState(false)

  const onSwitchCamera = () => {
    // カメラ切り替え中のフラグを設定
    setIsChangingCamera(true)

    // 新しいfacingModeを設定
    const newFacingMode = facingMode === "user" ? "environment" : "user"
    setFacingMode(newFacingMode)

    // カメラの切り替えを遅延させる
    setTimeout(() => {
      if (cameraRef.current) {
        try {
          // switchCameraを呼び出す
          cameraRef.current.switchCamera()
        } catch (error) {
          console.error("カメラ切り替えエラー:", error)
        } finally {
          // 処理完了後にフラグをリセット
          setTimeout(() => {
            setIsChangingCamera(false)
          }, 500)
        }
      }
    }, 500)
  }

  const handleTakePhoto = () => {
    if (!cameraRef.current) return
    const imageSrc = cameraRef.current.takePhoto()

    if (typeof imageSrc !== "string") return

    setImage(imageSrc)
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div
        style={{
          height: "calc(100vh - 240px)",
        }}
      >
        {!isChangingCamera && (
          <Camera cameraRef={cameraRef} facingMode={facingMode} />
        )}
      </div>
      <Button onClick={onSwitchCamera} disabled={isChangingCamera}>
        {isChangingCamera ? "カメラ切り替え中..." : "Switch camera"}
      </Button>
      <Button onClick={handleTakePhoto} disabled={isChangingCamera}>
        Take photo
      </Button>
      {image && (
        <Image src={image} alt="Taken photo" width={200} height={500} />
      )}
    </section>
  )
}
