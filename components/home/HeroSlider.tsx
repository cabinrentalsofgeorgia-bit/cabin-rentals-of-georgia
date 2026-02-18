'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

const slides = [
  {
    image: '/images/slider/1.jpeg',
    title: 'The Cabins',
    body: 'Experience Blue Ridge in a place where luxury is a way of life',
    titleAnimation: 'fadeleft',
    bodyAnimation: 'faderight',
  },
  {
    image: '/images/slider/2.jpeg',
    title: 'The Experience',
    body: 'A place to look for the unexpected and find more than you imagined',
    titleAnimation: 'fade',
    bodyAnimation: 'fade',
  },
  {
    image: '/images/slider/3.jpeg',
    title: 'The Memories',
    body: 'A place where friends and family reconnect...where ambiance creates lasting memories',
    titleAnimation: 'fade',
    bodyAnimation: 'fade',
  },
]

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const nextSlide = useCallback(() => {
    setIsAnimating(false)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
      setIsAnimating(true)
    }, 50)
  }, [])

  // Canvas overlay effect
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const overlayImage = new window.Image()
    overlayImage.src = '/images/bg_top_overlay7.png'

    const drawOverlay = () => {
      const { width, height } = container.getBoundingClientRect()

      // Set canvas size to match container
      canvas.width = width
      canvas.height = height

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw the overlay image to cover the entire canvas
      if (overlayImage.complete && overlayImage.naturalWidth > 0) {
        // Calculate scaling to cover the canvas (like object-fit: cover)
        const imgRatio = overlayImage.naturalWidth / overlayImage.naturalHeight
        const canvasRatio = width / height

        let drawWidth, drawHeight, offsetX, offsetY

        if (canvasRatio > imgRatio) {
          // Canvas is wider than image ratio
          drawWidth = width
          drawHeight = width / imgRatio
          offsetX = 0
          offsetY = (height - drawHeight) / 2
        } else {
          // Canvas is taller than image ratio
          drawHeight = height
          drawWidth = height * imgRatio
          offsetX = (width - drawWidth) / 2
          offsetY = 0
        }

        ctx.drawImage(overlayImage, offsetX, offsetY, drawWidth, drawHeight)
      }
    }

    overlayImage.onload = drawOverlay

    // Handle resize
    const handleResize = () => {
      drawOverlay()
    }

    window.addEventListener('resize', handleResize)

    // Initial draw
    if (overlayImage.complete) {
      drawOverlay()
    }

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 8000)

    return () => clearInterval(interval)
  }, [nextSlide])

  return (
    <div className="hero-slider-wrapper">
      {/* Main Slider Container */}
      <div className="hero-slider">
        <div className="slider-mask" ref={containerRef}>
          {/* Canvas Overlay */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full z-[9999] pointer-events-none"
          />
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
            >
              {/* Ken Burns Image Container */}
              <div className="slide-container">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                />
              </div>

              {/* Gradient Overlay */}
              <div className="slide-overlay" />

              {/* Captions */}
              <div className="slide-captions max-w-[280px]">
                <h2
                  className={`max-[767px]:max-w-[210px] max-[767px]:text-[180%] max-[767px]:leading-[90%] caption-title ${slide.titleAnimation} ${index === currentSlide && isAnimating ? 'animate-in' : ''
                    }`}
                >
                  {slide.title}
                </h2>
                <p
                  className={`max-[767px]:max-w-[210px] max-[767px]:text-[100%] max-[767px]:leading-[110%] caption-body ${slide.bodyAnimation} ${index === currentSlide && isAnimating ? 'animate-in' : ''
                    }`}
                >
                  {slide.body}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      <style jsx>{`
        .hero-slider-wrapper {
          width: 100%;
          height: 466px;
          background: url('/images/bg_top3.jpg') 50% 100% repeat-x;
          box-shadow: 0px 0px 40px -5px #000;
          position: relative;
          z-index: 2;
          overflow: hidden;
          margin-top: -4px;
        }

        @media (max-width: 1010px) {
          .hero-slider-wrapper {
            height: 380px;
          }
        }

        @media (max-width: 767px) {
          .hero-slider-wrapper {
            height: 220px;
          }
        }

        .hero-slider {
          position: relative;
          width: 100%;
          height: 100%;
          max-width: 1340px;
          margin: 0 auto;
        }

        .slider-mask {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          z-index: 0;
          transition: opacity 1s ease-in-out;
        }

        .slide.active {
          opacity: 1;
          z-index: 1;
        }

        .slide-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        /* Ken Burns Effect */
        .kb-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transform: scale(1);
          transition: transform 0s;
        }

        .kb-image.kb-animate {
          animation: kenburns 8s ease-out forwards;
        }

        @keyframes kenburns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.1) translate(-1%, -1%);
          }
        }

        /* Gradient Overlay */
        .slide-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.1) 0%,
            rgba(0, 0, 0, 0.2) 50%,
            rgba(0, 0, 0, 0.4) 100%
          );
          z-index: 2;
          pointer-events: none;
        }

        /* Captions */
        .slide-captions {
          position: absolute;
          left: 190px;
          top: 35%;
          transform: translateY(-50%);
          z-index: 10;
          text-align: left;
        }

        @media (max-width: 1010px) {
          .slide-captions {
            left: 80px;
            max-width: 80%;
          }
        }

        @media (max-width: 767px) {
          .slide-captions {
            left: 20px;
            right: 20px;
            max-width: calc(100% - 40px);
          }
        }

        @media (max-width: 450px) {
          .slide-captions {
            left: 50%;
            right: auto;
            transform: translate(-50%, -50%);
            max-width: calc(100% - 40px);
            text-align: center;
            margin-left: 0px!important;
            margin-top: 40px!important;
          }

          .caption-title {
            font-size: 21px!important;
          }
        }

        .caption-title {
          font-family: 'Fanwood Text',serif;
          font-size: 240%;
          font-weight: normal;
          font-style: italic;
          color: #fff;
          text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
          margin-bottom: 15px;
          opacity: 0;
          line-height: 1.2;
          text-align: center;
          background: url('/images/bg_rotator_title.png') no-repeat center bottom;
          padding-bottom: 30px;
        }

        @media (max-width: 1010px) {
          .caption-title {
            font-size: 24px;
            margin-bottom: 8px;
            background: none;
            padding-bottom: 0px;
          }
            .slide-captions{
              margin-top: 30px;
              margin-left: 0px;
              max-width: 280px
            }
        }

        @media (max-width: 767px) {
          .caption-title {
            font-size: 24px;
            margin-bottom: 8px;
            background: none;
            padding-bottom: 0px;
          }
            .slide-captions{
              margin-top: 30px;
              margin-left: 40px;
            }
        }

        .caption-body {
          font-family: 'Fanwood Text',serif;
          font-size: 19px;
          font-weight: normal;
          color: #fff;
          text-shadow: 1px 1px 6px rgba(0, 0, 0, 0.7);
          opacity: 0;
          line-height: 1.4;
          font-style: italic;
          text-align: center;
        }

        @media (max-width: 1010px) {
          .caption-body {
            font-size: 18px;
          }
        }

        @media (max-width: 767px) {
          .caption-body {
            font-size: 14px;
          }
        }

        /* Animation Classes */
        .caption-title.fadeleft {
          transform: translateX(-50px);
        }

        .caption-title.fadeleft.animate-in {
          animation: fadeleft 1s ease-out forwards;
          animation-delay: 0.3s;
        }

        .caption-body.faderight {
          transform: translateX(50px);
        }

        .caption-body.faderight.animate-in {
          animation: faderight 1s ease-out forwards;
          animation-delay: 0.6s;
        }

        .caption-title.fade,
        .caption-body.fade {
          transform: translateY(20px);
        }

        .caption-title.fade.animate-in {
          animation: fadeup 1s ease-out forwards;
          animation-delay: 0.3s;
        }

        .caption-body.fade.animate-in {
          animation: fadeup 1s ease-out forwards;
          animation-delay: 0.6s;
        }

        @keyframes fadeleft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes faderight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeup {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

      `}</style>
    </div>
  )
}

