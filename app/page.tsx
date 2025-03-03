"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { CameraType } from "react-camera-pro"

import { Button } from "@/components/ui/button"
import Camera from "@/components/camera"

export default function IndexPage() {
  const cameraRef = useRef<CameraType>(null)
  const [image, setImage] = useState<string | null>(null)

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
        <Camera cameraRef={cameraRef} />
      </div>
      <Button onClick={handleTakePhoto}>Take photo</Button>
      {image && (
        <Image src={image} alt="Taken photo" width={200} height={500} />
      )}
    </section>
  )
}
