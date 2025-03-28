import React, { useState } from "react";
import { FaPlus, FaCheckDouble, FaEye, FaCheck, FaCalendarAlt, FaBell, FaReply, FaExternalLinkAlt } from "react-icons/fa";
import { MdAssignment, MdCancel, MdSystemUpdateAlt } from "react-icons/md";

const initialNotifications = [
  { id: 1, icon: <MdAssignment className="text-blue-500 text-lg" />, title: "New Assignment Submission", description: 'Sarah Johnson submitted "Differential Equations".', time: "2 hours ago", unread: true },
  { id: 2, icon: <FaCalendarAlt className="text-green-500 text-lg" />, title: "Session Request Accepted", description: "Michael Zhang accepted your session request.", time: "3 hours ago", unread: true },
  { id: 3, icon: <FaBell className="text-yellow-500 text-lg" />, title: "Assignment Due Date Approaching", description: 'Reminder: "Mechanics Problem Set" is due soon.', time: "1 day ago", unread: false },
];

const NotificationItem = ({ notification, markAsRead }) => (
  <div className={`p-4 border-b border-gray-200 ${notification.unread ? "bg-blue-50" : "hover:bg-green-400"}`}>
    <div className="flex gap-4">
      <div className="mt-1">{notification.icon}</div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <h3 className="font-bold ">{notification.title}</h3>
          <span className="text-base">{notification.time}</span>
        </div>
        <p className="">{notification.description}</p>
        <div className="flex gap-2 mt-2">
          <button className="text-[#2563eb] hover:text-blue-700 text-base flex items-center gap-1">
            <FaEye /> View
          </button>
          {notification.unread && (
            <button className="text-gray-900 hover:text-gray-700 text-base flex items-center gap-1" onClick={() => markAsRead(notification.id)}>
              <FaCheck /> Mark as Read
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

const Notifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [showModal, setShowModal] = useState(false);
  const [newNotification, setNewNotification] = useState({ title: "", description: "" });

  const createNotification = () => {
    if (!newNotification.title || !newNotification.description) return;
    const newNotif = {
      id: notifications.length + 1,
      icon: <FaBell className="text-blue-500 text-lg" />,
      title: newNotification.title,
      description: newNotification.description,
      time: "Just now",
      unread: true,
    };
    setNotifications([newNotif, ...notifications]);
    setShowModal(false);
    setNewNotification({ title: "", description: "" });
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, unread: false })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, unread: false } : notif)));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex gap-2">
          <button className="bg-[#2563eb] hover:bg-blue-600 hover:text-[#146356] text-white px-4 py-2 rounded-md flex items-center gap-2" onClick={() => setShowModal(true)}>
            <FaPlus /> Create Notification
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md flex items-center gap-2" onClick={markAllAsRead}>
            <FaCheckDouble /> Mark All as Read
          </button>
        </div>
      </div>

      <div className="bg-[#146356] text-white rounded-lg shadow-md overflow-hidden">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} markAsRead={markAsRead} />
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Create Notification</h2>
            <input type="text" placeholder="Title" className="w-full p-2 border rounded mb-2" value={newNotification.title} onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })} />
            <textarea placeholder="Description" className="w-full p-2 border rounded mb-2" value={newNotification.description} onChange={(e) => setNewNotification({ ...newNotification, description: e.target.value })}></textarea>
            <div className="flex justify-end gap-2">
              <button className="bg-gray-300 px-4 py-2 rounded-md" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={createNotification}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
