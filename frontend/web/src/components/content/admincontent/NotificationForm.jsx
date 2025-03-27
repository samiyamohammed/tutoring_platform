import React from 'react'

const NotificationForm = () => {
  return (
    <div className="bg-[#145D52] p-4 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">Send Notification</h2>
      <form>
        <div className="mb-4 text-white">
          <label className="block text-base font-bold mb-2" htmlFor="notification-title">
            Notification Title
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
            id="notification-title"
            type="text"
            placeholder="Enter notification title"
          />
        </div>
        <div className="mb-4 text-white">
          <label className="block text-base font-bold mb-2" htmlFor="message">
            Message
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
            id="message"
            placeholder="Enter notification message"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            Recipients
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2">All Users</span>
            </label>
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2">Students Only</span>
            </label>
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2">Tutors Only</span>
            </label>
          </div>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
        >
          Send Notification
        </button>
      </form>
    </div>
  )
}

export default NotificationForm
