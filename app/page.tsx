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
  const [isVisible, setIsVisible] = useState(true) // ページの可視性状態を追跡

  // ページの可視性変更を検出
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isDocumentVisible = document.visibilityState === "visible"
      console.log("Visibility changed:", isDocumentVisible)

      if (isDocumentVisible && !isVisible) {
        // ページが非表示から表示に変わった場合、カメラを再初期化
        console.log("Page became visible, reinitializing camera")
        setKey((prevKey) => prevKey + 1)
      }

      setIsVisible(isDocumentVisible)
    }

    // 初期状態を設定
    setIsVisible(document.visibilityState === "visible")

    // イベントリスナーを追加
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      // クリーンアップ
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isVisible])

  // カメラ切り替え処理が完了しない場合のタイムアウト処理
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    if (isChangingCamera) {
      // 最大10秒後に強制的にリセット
      timeoutId = setTimeout(() => {
        console.log("カメラ切り替えタイムアウト: 強制リセット")
        setIsChangingCamera(false)
      }, 10000)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isChangingCamera])

  const onSwitchCamera = () => {
    if (isChangingCamera) return // 既に切り替え中なら何もしない

    // カメラ切り替え中のフラグを設定
    setIsChangingCamera(true)

    // 新しいfacingModeを設定
    const newFacingMode = facingMode === "user" ? "environment" : "user"
    setFacingMode(newFacingMode)

    try {
      // カメラコンポーネントを強制的に再マウント
      setKey((prevKey) => prevKey + 1)

      // 一定時間後にカメラ切り替え完了とする
      setTimeout(() => {
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
      <div
        style={{
          height: "calc(100vh - 240px)",
        }}
      >
        {isVisible && (
          <Camera key={key} cameraRef={cameraRef} facingMode={facingMode} />
        )}
      </div>
      <Button
        onClick={onSwitchCamera}
        disabled={isChangingCamera || !isVisible}
      >
        {isChangingCamera ? "カメラ切り替え中..." : "Switch camera"}
      </Button>
      <Button
        onClick={handleTakePhoto}
        disabled={isChangingCamera || !isVisible}
      >
        Take photo
      </Button>
      {image && (
        <Image src={image} alt="Taken photo" width={200} height={500} />
      )}
    </section>
  )
}
