import React from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription
} from "@/components/ui/alert-dialog"

interface PickingAlertDialogProps {
  open: boolean;
}

export function PickingAlertDialog({ open }: PickingAlertDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="bg-amber-100 border-amber-500">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-amber-700">stop picking!</AlertDialogTitle>
          <AlertDialogDescription className="text-amber-600">
            you&apos;ve been detected picking at your lips. try to be mindful and avoid this behavior! put on some lip balm🙂
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  )
}