"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Webcam from "react-webcam"

import { Button } from "@/components/ui/button"

export default function WebcamPage() {
  const webcamRef = useRef<Webcam>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [key, setKey] = useState(0)
  const [isPageVisible, setIsPageVisible] = useState(true)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)

  // デバイスの検出
  const handleDevices = useCallback((mediaDevices: MediaDeviceInfo[]) => {
    const videoDevices = mediaDevices.filter(
      ({ kind }) => kind === "videoinput"
    )
    setDevices(videoDevices)
    setHasMultipleCameras(videoDevices.length > 1)
    console.log("検出されたカメラデバイス:", videoDevices.length)
  }, [])

  // カメラデバイスの列挙
  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then(handleDevices)
      .catch((err) => {
        console.error("デバイス検出エラー:", err)
      })
  }, [handleDevices])

  // ページの可視性変更の検出
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === "visible"
      console.log("ページ可視性の変更:", visible)

      if (visible && !isPageVisible) {
        console.log("ページが表示状態になりました、カメラを再初期化します")
        // ページが再表示された時にカメラを再初期化
        setKey((prevKey) => prevKey + 1)
      }

      setIsPageVisible(visible)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isPageVisible])

  // タイムアウト処理
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    if (isSwitchingCamera) {
      timeoutId = setTimeout(() => {
        console.log("カメラ切り替えタイムアウト: 強制リセット")
        setIsSwitchingCamera(false)
      }, 5000)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isSwitchingCamera])

  // カメラの切り替え
  const switchCamera = useCallback(() => {
    if (isSwitchingCamera) return

    try {
      setIsSwitchingCamera(true)
      const newMode = facingMode === "user" ? "environment" : "user"
      console.log(`カメラを切り替えます: ${facingMode} → ${newMode}`)
      setFacingMode(newMode)

      // キーを変更してコンポーネントを強制的に再マウント
      setKey((prevKey) => prevKey + 1)

      // 切り替え完了を待つ
      setTimeout(() => {
        setIsSwitchingCamera(false)
      }, 2000)
    } catch (error) {
      console.error("カメラ切り替えエラー:", error)
      setIsSwitchingCamera(false)
    }
  }, [facingMode, isSwitchingCamera])

  // 写真撮影
  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) return

    try {
      const imageSrc = webcamRef.current.getScreenshot()
      if (imageSrc) {
        console.log("写真を撮影しました")
        setImage(imageSrc)
      }
    } catch (error) {
      console.error("写真撮影エラー:", error)
    }
  }, [])

  // カメラのビデオ制約
  const videoConstraints = {
    facingMode: facingMode,
    width: { ideal: 1280 },
    height: { ideal: 720 },
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div
        style={{
          height: "calc(100vh - 240px)",
          position: "relative",
          overflow: "hidden",
          borderRadius: "24px",
        }}
      >
        {isPageVisible && (
          <Webcam
            key={key}
            ref={webcamRef}
            audio={false}
            videoConstraints={videoConstraints}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.92}
            forceScreenshotSourceSize
            mirrored={facingMode === "user"}
            onUserMediaError={(err) => {
              console.error("カメラアクセスエラー:", err)
              setIsSwitchingCamera(false)
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        {hasMultipleCameras && (
          <Button
            onClick={switchCamera}
            disabled={isSwitchingCamera || !isPageVisible}
            className="flex-1"
          >
            {isSwitchingCamera ? "カメラ切り替え中..." : "カメラを切り替える"}
          </Button>
        )}

        <Button
          onClick={capturePhoto}
          disabled={isSwitchingCamera || !isPageVisible}
          className="flex-1"
        >
          写真を撮影
        </Button>
      </div>

      {image && (
        <div className="mt-4">
          <h3 className="mb-2 text-lg font-medium">撮影された写真</h3>
          <Image
            src={image}
            alt="撮影された写真"
            width={300}
            height={200}
            style={{
              objectFit: "contain",
              borderRadius: "12px",
            }}
          />
        </div>
      )}
    </section>
  )
}
