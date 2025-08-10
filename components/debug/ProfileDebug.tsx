'use client'

import React, { useState } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { createClient } from '@/utils/supabase/client'

interface ProfileDebugProps {
  user: any
}

const ProfileDebug: React.FC<ProfileDebugProps> = ({ user }) => {
  const { profile, loading, error } = useUserProfile(user?.id)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [testResult, setTestResult] = useState<string>('')

  const runDebugTests = async () => {
    const supabase = createClient()
    const results: any = {}

    try {
      // Test 1: Check current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      results.currentUser = currentUser ? { id: currentUser.id, email: currentUser.email } : null
      results.userError = userError

      // Test 2: Check profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()
      
      results.profileData = profileData
      results.profileError = profileError

      // Test 3: Test storage list
      const { data: storageList, error: storageError } = await supabase.storage
        .from('profile-photos')
        .list(user?.id || '')
      
      results.storageList = storageList
      results.storageError = storageError

      // Test 4: Check auth.uid()
      const { data: authUid, error: authError } = await supabase
        .rpc('get_current_user_id')
        .single()
      
      results.authUid = authUid
      results.authError = authError

      setDebugInfo(results)
      setTestResult('Tests completed - check results below')
    } catch (err) {
      setTestResult(`Error running tests: ${err}`)
      console.error('Debug test error:', err)
    }
  }

  const testPhotoUpload = async () => {
    // Create a small test image
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#ff0000'
      ctx.fillRect(0, 0, 100, 100)
    }

    canvas.toBlob(async (blob) => {
      if (!blob) return

      const file = new File([blob], 'test.png', { type: 'image/png' })
      const supabase = createClient()

      try {
        const fileName = `${user?.id}/test-${Date.now()}.png`
        
        console.log('Uploading test file:', fileName)
        const { data, error } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, file)

        if (error) {
          setTestResult(`Upload failed: ${error.message}`)
          console.error('Upload error:', error)
        } else {
          setTestResult(`Upload successful: ${data.path}`)
          console.log('Upload success:', data)
        }
      } catch (err) {
        setTestResult(`Upload exception: ${err}`)
        console.error('Upload exception:', err)
      }
    }, 'image/png')
  }

  if (loading) return <div>Loading debug info...</div>

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Profile Debug Info</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">User Info:</h4>
          <pre className="text-xs bg-white p-2 rounded">
            {JSON.stringify({ id: user?.id, email: user?.email }, null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="font-semibold">Profile State:</h4>
          <pre className="text-xs bg-white p-2 rounded">
            {JSON.stringify({ profile, error: error?.message }, null, 2)}
          </pre>
        </div>

        <div className="space-x-2">
          <button
            onClick={runDebugTests}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Run Debug Tests
          </button>
          
          <button
            onClick={testPhotoUpload}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Photo Upload
          </button>
        </div>

        {testResult && (
          <div className="p-2 bg-yellow-100 rounded">
            <strong>Test Result:</strong> {testResult}
          </div>
        )}

        {debugInfo && (
          <div>
            <h4 className="font-semibold">Debug Results:</h4>
            <pre className="text-xs bg-white p-2 rounded max-h-96 overflow-y-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileDebug