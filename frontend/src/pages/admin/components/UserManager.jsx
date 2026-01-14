import React from 'react';
import adminService from '../../../services/adminService';

export default function UserManager({ users, onUpdate }) {
    
    const handleToggleAdmin = async (user) => {
        const newRoles = user.roles.includes('ROLE_ADMIN') 
            ? ['ROLE_USER'] 
            : ['ROLE_USER', 'ROLE_ADMIN'];

        try {
            await adminService.updateUserRoles(user.id, newRoles);
            alert(`Updated roles for ${user.email}`);
            onUpdate();
        } catch (err) {
            alert("Error updating roles", err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user? This cannot be undone.")) {
            try {
                await adminService.deleteUser(id);
                onUpdate();
            } catch (err) {
                alert("Error deleting user", err);
            }
        }
    };

    return (
        <div className="manager-container">
            <h2 className="tab-title">User Governance</h2>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Roles</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.firstName} {u.lastName}</td>
                            <td>{u.email}</td>
                            <td>
                                <span className={`badge ${u.verified ? 'FINISHED' : 'SCHEDULED'}`}>
                                    {u.verified ? 'Verified' : 'Pending'}
                                </span>
                            </td>
                            <td>{u.roles.map(r => r.replace('ROLE_', '')).join(', ')}</td>
                            <td className="action-cell">
                                <button 
                                    className="update-btn" 
                                    onClick={() => handleToggleAdmin(u)}
                                >
                                    {u.roles.includes('ROLE_ADMIN') ? 'Demote' : 'Promote to Admin'}
                                </button>
                                <button 
                                    className="delete-btn" 
                                    onClick={() => handleDelete(u.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}