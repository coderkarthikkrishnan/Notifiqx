import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { addDoc, collection, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
    UploadSimple,
    X,
    Image as ImageIcon,
    Trash,
    LinkSimple,
    Sparkle,
    PencilSimple,
    FilePdf,
    Plus
} from 'phosphor-react';
import { rewriteText } from '../lib/gemini';
import './CreateNotice.css';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const CreateNotice = ({ onClose, onSuccess, initialData, user }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        images: initialData?.images || initialData?.attachments || [], // Fallback for old data
        links: initialData?.links || [],
        category: initialData?.category || 'General',
        department: initialData?.department || 'All',
        priority: initialData?.priority || 'Medium',
        color: initialData?.color || 'default'
    });

    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // New Link State
    const [newLink, setNewLink] = useState({ name: '', url: '' });
    const [editingLinkIndex, setEditingLinkIndex] = useState(null);
    const [isPreview, setIsPreview] = useState(false);

    /* ===============================
       IMAGE UPLOAD (Cloudinary)
    =============================== */
    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(uploadImage);
    };

    const uploadImage = (file) => {
        if (!file.type.startsWith('image/')) {
            alert('Only images allowed');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            alert(`${file.name} exceeds 50MB`);
            return;
        }

        setUploading(true);
        setProgress(0);

        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', UPLOAD_PRESET);

        const xhr = new XMLHttpRequest();
        xhr.open(
            'POST',
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
        );

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                setProgress(Math.round((e.loaded / e.total) * 100));
            }
        };

        xhr.onload = () => {
            const res = JSON.parse(xhr.responseText);

            setFormData(prev => ({
                ...prev,
                images: [
                    ...prev.images,
                    {
                        url: res.secure_url,
                        name: file.name
                    }
                ]
            }));

            setUploading(false);
            setProgress(0);
        };

        xhr.onerror = () => {
            alert('Image upload failed');
            setUploading(false);
        };

        xhr.send(data);
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    /* ===============================
       LINK MANAGEMENT
    =============================== */
    const addLink = () => {
        if (!newLink.url) return;

        if (editingLinkIndex !== null) {
            // Update existing
            setFormData(prev => {
                const updated = [...prev.links];
                updated[editingLinkIndex] = { ...newLink };
                return { ...prev, links: updated };
            });
            setEditingLinkIndex(null);
        } else {
            // Add new
            setFormData(prev => ({
                ...prev,
                links: [...prev.links, { ...newLink }]
            }));
        }
        setNewLink({ name: '', url: '' });
    };

    const editLink = (index) => {
        const link = formData.links[index];
        setNewLink({ ...link });
        setEditingLinkIndex(index);
    };

    const removeLink = (index) => {
        setFormData(prev => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index)
        }));
        if (editingLinkIndex === index) {
            setEditingLinkIndex(null);
            setNewLink({ name: '', url: '' });
        }
    };

    /* ===============================
       GEMINI AI REWRITE
    =============================== */
    const handleGeminiRewrite = async (tone) => {
        if (!formData.description) return alert("Please enter some text to rewrite.");

        setSubmitting(true);
        try {
            const text = await rewriteText(formData.description, tone);
            setFormData(prev => ({ ...prev, description: text }));
        } catch (error) {
            console.error(error);
            alert("Failed to rewrite: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    /* ===============================
       SUBMIT
    =============================== */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Auto-add pending link if user forgot to click '+'
            let finalLinks = [...formData.links];
            if (newLink.url.trim()) {
                finalLinks.push({
                    url: newLink.url.trim(),
                    name: newLink.name.trim() || newLink.url.trim()
                });
            }

            const payload = {
                ...formData,
                links: finalLinks,
                // Ensure we save clean data
                externalLink: '', // Deprecated
                createdAt: Timestamp.now(),
                authorId: user.uid,
                authorName: user.name || user.email,
                collegeId: user.collegeId,
                likes: [],
                reads: []
            };

            if (initialData?.id) {
                await updateDoc(doc(db, 'notices', initialData.id), payload);
            } else {
                await addDoc(collection(db, 'notices'), payload);
            }

            onSuccess(true);
            onClose();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">

                <header className="modal-header">
                    <h2>{initialData ? 'Edit Notice' : 'Create Notice'}</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={18} />
                    </button>
                </header>

                <form className="create-form" onSubmit={handleSubmit}>

                    {/* TITLE */}
                    <div className="form-group full-width">
                        <label>Title</label>
                        <input
                            className="form-control"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div className="form-group full-width">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ margin: 0 }}>Description</label>
                            <div className="preview-toggle">
                                <button
                                    type="button"
                                    className={`toggle-btn ${!isPreview ? 'active' : ''}`}
                                    onClick={() => setIsPreview(false)}
                                >
                                    Write
                                </button>
                                <button
                                    type="button"
                                    className={`toggle-btn ${isPreview ? 'active' : ''}`}
                                    onClick={() => setIsPreview(true)}
                                >
                                    Preview
                                </button>
                            </div>
                        </div>

                        {!isPreview ? (
                            <>
                                <div className="ai-container">
                                    <span className="ai-label">Rewrite with Gemini:</span>
                                    <div className="ai-actions">
                                        <button type="button" onClick={() => handleGeminiRewrite('Professional')} className="btn-ai">
                                            <Sparkle size={12} weight="fill" /> Professional
                                        </button>
                                        <button type="button" onClick={() => handleGeminiRewrite('Casual')} className="btn-ai">
                                            <Sparkle size={12} weight="fill" /> Casual
                                        </button>
                                        <button type="button" onClick={() => handleGeminiRewrite('Concise')} className="btn-ai">
                                            <Sparkle size={12} weight="fill" /> Concise
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    className="form-control"
                                    rows={5}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Type a rough draft and let AI polish it... (Markdown supported)"
                                />
                            </>
                        ) : (
                            <div className="markdown-preview form-control" style={{ minHeight: '150px', background: 'var(--gray-50)', overflowY: 'auto' }}>
                                {formData.description ? (
                                    <ReactMarkdown>{formData.description}</ReactMarkdown>
                                ) : (
                                    <p className="text-muted">Nothing to preview yet.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* CATEGORY & METADATA GRID */}
                    <div className="form-group">
                        <label>Category</label>
                        <select
                            className="form-control"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="General">General</option>
                            <option value="Exam">Exam</option>
                            <option value="Event">Event</option>
                            <option value="Urgent">Urgent</option>
                            <option value="Verified">Verified</option>
                            <option value="Holiday">Holiday</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Priority</label>
                        <select
                            className="form-control"
                            value={formData.priority}
                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                    {/* NEW LINKS SECTION */}
                    <div className="form-group full-width">
                        <label>Links & Resources</label>
                        <div className="link-input-row">
                            <input
                                className="form-control"
                                placeholder="Link URL (e.g. drive.google.com...)"
                                value={newLink.url}
                                onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                                style={{ flex: 2 }}
                            />
                            <input
                                className="form-control"
                                placeholder="Link Name (Optional)"
                                value={newLink.name}
                                onChange={e => setNewLink({ ...newLink, name: e.target.value })}
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={addLink}
                                className={`btn-add-link ${editingLinkIndex !== null ? "btn-primary" : "btn-secondary"}`}
                                title={editingLinkIndex !== null ? "Update Link" : "Add Link"}
                            >
                                {editingLinkIndex !== null ? (
                                    <PencilSimple size={20} />
                                ) : (
                                    <div className="link-plus-icon">
                                        <LinkSimple size={20} />
                                        <Plus size={12} weight="bold" className="plus-overlay" />
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Link List */}
                        {formData.links.length > 0 && (
                            <div className="links-list">
                                {formData.links.map((link, i) => (
                                    <div key={i} className={`link-item ${editingLinkIndex === i ? 'editing' : ''}`}>
                                        <div className="link-info">
                                            {/* Auto-detect PDF Icon */}
                                            {link.url.toLowerCase().includes('pdf') ? <FilePdf size={16} /> : <LinkSimple size={16} />}
                                            <a href={link.url} target="_blank" rel="noreferrer">
                                                {link.name || link.url}
                                            </a>
                                        </div>
                                        <div className="link-actions">
                                            <button type="button" onClick={() => editLink(i)} className="edit-link" title="Edit Link">
                                                <PencilSimple size={14} />
                                            </button>
                                            <button type="button" onClick={() => removeLink(i)} className="remove-link" title="Remove Link">
                                                <Trash size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* IMAGE UPLOAD */}
                    <div className="form-group full-width">
                        <label>Images (Max 50MB each)</label>

                        <input
                            type="file"
                            multiple
                            hidden
                            id="image-upload"
                            accept="image/*"
                            onChange={handleImages}
                        />

                        <label htmlFor="image-upload" className="file-upload-box">
                            <UploadSimple size={28} />
                            <span>Upload images</span>
                            <small>JPG / PNG / WEBP</small>
                        </label>

                        {uploading && (
                            <div className="upload-progress">
                                Uploading… {progress}%
                                <div className="progress-bar">
                                    <span style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* IMAGE PREVIEW */}
                    {formData.images.length > 0 && (
                        <div className="image-grid full-width">
                            {formData.images.map((img, i) => (
                                <div key={i} className="image-preview-card">
                                    <img src={img.url} alt={img.name} />
                                    <button type="button" onClick={() => removeImage(i)}>
                                        <Trash size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* COLOR SELECTION */}
                    <div className="form-group full-width">
                        <label>Card Color</label>
                        <div className="color-selector">
                            {['default', 'red', 'blue', 'green', 'yellow'].map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`color-swatch ${c} ${formData.color === c ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, color: c })}
                                />
                            ))}
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="form-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Publishing…' : 'Publish'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateNotice;
