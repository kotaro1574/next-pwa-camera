"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Webcam from "react-webcam"

import { Button } from "@/components/ui/button"

export default function WebcamPage() {
  const webcamRef = useRef<Webcam>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [key, setKey] = useState(0)

  // コンポーネントのアンマウント時にカメラリソースを解放
  useEffect(() => {
    return () => {
      // MediaStreamの取得とトラックの停止
      if (webcamRef.current && webcamRef.current.video) {
        const video = webcamRef.current.video
        const stream = video.srcObject as MediaStream
        if (stream) {
          const tracks = stream.getTracks()
          tracks.forEach((track) => track.stop())
          video.srcObject = null
        }
      }

      // streamRefに保存されているStreamがあれば停止
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks()
        tracks.forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  // カメラの切り替え
  const switchCamera = useCallback(() => {
    if (isSwitchingCamera) return

    try {
      setIsSwitchingCamera(true)

      // 現在のストリームがあれば停止
      if (webcamRef.current && webcamRef.current.video) {
        const video = webcamRef.current.video
        const stream = video.srcObject as MediaStream
        if (stream) {
          const tracks = stream.getTracks()
          tracks.forEach((track) => track.stop())
        }
      }

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

  // ストリーム取得成功時の処理を追加
  const handleUserMedia = useCallback((stream: MediaStream) => {
    streamRef.current = stream
    console.log("カメラストリーム取得成功")
  }, [])

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
      <h1>react-webcam</h1>
      <div
        style={{
          height: "calc(100vh - 240px)",
          position: "relative",
          overflow: "hidden",
          borderRadius: "24px",
        }}
      >
        <Webcam
          key={key}
          ref={webcamRef}
          audio={false}
          videoConstraints={videoConstraints}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.92}
          forceScreenshotSourceSize
          mirrored={facingMode === "user"}
          onUserMedia={handleUserMedia}
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
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          onClick={switchCamera}
          disabled={isSwitchingCamera}
          className="flex-1"
        >
          {isSwitchingCamera ? "カメラ切り替え中..." : "カメラを切り替える"}
        </Button>

        <Button
          onClick={capturePhoto}
          disabled={isSwitchingCamera}
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
