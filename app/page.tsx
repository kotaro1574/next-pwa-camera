// app/page.tsx のカメラリソース解放部分の修正
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
  const [key, setKey] = useState(0) // カメラコンポーネントを強制的に再マウントするためのキー

  // コンポーネントのアンマウント時にカメラリソースを解放
  useEffect(() => {
    return () => {
      // react-camera-proではCameraTypeにstopメソッドが直接実装されていないため、
      // コンポーネントのアンマウント時はkeyの変更で強制的に再マウントさせる方法や
      // Cameraコンポーネント側でのリソース解放に依存する
      console.log("カメラコンポーネントのアンマウント")

      // Cameraコンポーネントをアンマウントして再マウントさせるためにkeyを更新
      setKey((prev) => prev + 999)
    }
  }, [])

  const onSwitchCamera = () => {
    if (isChangingCamera) return // 既に切り替え中なら何もしない

    // カメラ切り替え中のフラグを設定
    setIsChangingCamera(true)

    // 既存のカメラストリームを停止する直接的な方法はないため、
    // コンポーネントの再マウントによるリソース解放に依存

    // 新しいfacingModeを設定
    const newFacingMode = facingMode === "user" ? "environment" : "user"
    setFacingMode(newFacingMode)

    try {
      // 一定時間後にカメラ切り替え完了とする
      setTimeout(() => {
        // カメラコンポーネントを強制的に再マウント
        setKey((prevKey) => prevKey + 1)
        setIsChangingCamera(false)
      }, 2000)
    } catch (error) {
      console.error("カメラ切り替えエラー:", error)
      // エラー発生時も必ずフラグをリセット
      setIsChangingCamera(false)
    }
  }

  const handleTakePhoto = () => {
    if (!cameraRef.current) return
    const imageSrc = cameraRef.current.takePhoto()

    if (typeof imageSrc !== "string") return

    setImage(imageSrc)
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <h1>react-camera-pro</h1>
      <div
        style={{
          height: "calc(100vh - 240px)",
        }}
      >
        <Camera key={key} cameraRef={cameraRef} facingMode={facingMode} />
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
