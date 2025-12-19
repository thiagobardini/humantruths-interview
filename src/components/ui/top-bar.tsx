'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Github, Video } from 'lucide-react'

export function TopBar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-10 items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="gap-1.5 text-xs transition-all"
          >
            {isOpen ? (
              <>
                <span>Hide</span>
                <ChevronUp className="h-3.5 w-3.5 transition-transform" />
              </>
            ) : (
              <>
                <Video className="h-3.5 w-3.5" />
                <span>Demo Video</span>
                <ChevronDown className="h-3.5 w-3.5 transition-transform" />
              </>
            )}
          </Button>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t py-3">
            <div className="flex flex-col gap-3">
              {/* Video */}
              <div className="flex justify-center">
                <iframe
                  src="https://share.descript.com/embed/MdsgRwxsjsk"
                  width="640"
                  height="360"
                  frameBorder="0"
                  allowFullScreen
                  className="max-w-full rounded-lg"
                />
              </div>

              {/* GitHub Link */}
              <div className="flex items-center justify-center gap-1.5">
                <Github className="h-3.5 w-3.5" />
                <a
                  href="https://github.com/thiagobardini/voice-ai-analytics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

