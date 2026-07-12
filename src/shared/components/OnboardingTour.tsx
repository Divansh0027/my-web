import { useState, useEffect } from 'react'
import { Joyride, CallBackProps, STATUS } from 'react-joyride'

export function OnboardingTour() {
  const [run, setRun] = useState(false)

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour')
    if (!hasSeenTour) {
      // Delay starting the tour slightly to let the UI settle
      setTimeout(() => setRun(true), 2000)
    }
  }, [])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

    if (finishedStatuses.includes(status)) {
      setRun(false)
      localStorage.setItem('hasSeenTour', 'true')
    }
  }

  const steps = [
    {
      target: '#search-properties-input',
      content: 'Search for properties by location, type, or budget easily.',
      disableBeacon: true,
    },
    {
      target: '#save-property-btn', // Assuming we add this ID to a save button
      content: 'Save properties you like to view them later.',
    },
    {
      target: '#nav-list-property',
      content: 'Got a property to sell or rent? List it here!',
    },
    {
      target: '#user-profile-menu',
      content: 'Access your saved properties and preferences here.',
    },
  ]

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#7c6214', // gold-accent
          backgroundColor: '#ffffff',
          textColor: '#ffffff',
        },
      }}
    />
  )
}
