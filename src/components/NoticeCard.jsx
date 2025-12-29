import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Calendar, Tag, ShareNetwork, PushPin, Heart, Trash, LinkSimple, FilePdf, PencilSimple, X, CaretLeft, CaretRight, Fire, Ticket, CircleWavyCheck } from 'phosphor-react';
import { formatDate, getPriorityColor } from '../lib/utils';
import './NoticeCard.css';

const NoticeCard = ({ notice, user, onPin, onLike, onEdit, onDelete }) => {
    const isExpired = notice.expiryDate ? new Date(notice.expiryDate) < new Date() : false;
    const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
    const [currentImageIndex, setCurrentImageIndex] = React.useState(null);

    const displayImages = notice.images || notice.attachments?.filter(a => a.type?.startsWith('image')) || [];

    const handleNext = (e) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    };

    const handlePrev = (e) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    };

    React.useEffect(() => {
        if (currentImageIndex === null) return;

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') setCurrentImageIndex(null);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentImageIndex, displayImages.length]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: notice.title,
                text: notice.description,
                url: window.location.href,
            }).catch(console.error);
        } else {
            const url = `${window.location.origin}?notice=${notice.id}`;
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    };

    const cardStyle = {
        borderLeftColor: getPriorityColor(notice.priority),
        backgroundColor: (notice.color && notice.color !== 'default') ? `var(--theme-${notice.color}-bg)` : undefined,
        borderColor: (notice.color && notice.color !== 'default') ? `var(--theme-${notice.color}-border)` : undefined,
    };

    const displayLinks = notice.links || [];
    if (notice.externalLink) {
        displayLinks.push({ url: notice.externalLink, name: 'External Link' });
    }

    const getCategoryIcon = (cat) => {
        const c = cat?.toLowerCase();
        if (c?.includes('urgent')) return <Fire size={14} weight="fill" />;
        if (c?.includes('exam')) return <Ticket size={14} weight="fill" />;
        if (c?.includes('verified')) return <CircleWavyCheck size={14} weight="fill" />;
        return <Tag size={14} />;
    };

    // Swipe Logic
    const [touchStart, setTouchStart] = React.useState(null);
    const [touchEnd, setTouchEnd] = React.useState(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null); // Reset
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNext();
        }
        if (isRightSwipe) {
            handlePrev();
        }
    };

    return (
        <>
            <div
                className={`notice-card ${isExpired ? 'expired' : ''} ${notice.color && notice.color !== 'default' ? `theme-${notice.color}` : ''}`}
                style={cardStyle}
            >
                <div className="card-header">
                    <span className={`badge-pill badge-${notice.category?.toLowerCase()?.replace(/\s+/g, '-') || 'general'}`}>
                        {getCategoryIcon(notice.category)}
                        {notice.category || 'General'}
                    </span>
                    {isAdmin && (
                        <div className="card-top-actions">
                            {/* Actions moved to footer or specific edit/delete buttons below */}
                        </div>
                    )}
                </div>

                <div className="card-body">
                    <h3 className="notice-title">{notice.title}</h3>

                    {notice.description && (
                        <div className="notice-description">
                            <ReactMarkdown
                                components={{
                                    a: ({ node, ...props }) => {
                                        let url = props.href || '';
                                        if (url && !url.startsWith('http') && !url.startsWith('/')) {
                                            url = 'https://' + url;
                                        }
                                        return <a {...props} href={url} target="_blank" rel="noopener noreferrer" />;
                                    }
                                }}
                            >
                                {notice.description}
                            </ReactMarkdown>
                        </div>
                    )}

                    {/* Image Preview */}
                    {displayImages.length > 0 && (
                        <div className="card-image-preview" onClick={() => setCurrentImageIndex(0)}>
                            <img src={displayImages[0].url} alt="Preview" />
                            {displayImages.length > 1 && <span className="image-count">+{displayImages.length - 1}</span>}
                        </div>
                    )}

                    {/* Attachments/Links */}
                    {displayLinks.length > 0 && (
                        <div className="card-links">
                            {displayLinks.map((link, i) => {
                                let url = link.url;
                                if (url && !url.startsWith('http')) {
                                    url = 'https://' + url;
                                }
                                return (
                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="link-chip">
                                        <LinkSimple size={16} />
                                        {link.name || 'Attachment'}
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="card-footer">
                    <div className="footer-date">
                        <Calendar size={18} /> {formatDate(notice.createdAt)}
                    </div>

                    <div className="footer-actions">
                        <button className="icon-action" onClick={() => onPin(notice.id)} title="Pin">
                            <PushPin size={18} weight={user?.pinnedNotices?.includes(notice.id) ? 'fill' : 'regular'} />
                        </button>

                        {isAdmin && (
                            <>
                                <button className="icon-action" onClick={() => onEdit && onEdit(notice)} title="Edit">
                                    <PencilSimple size={18} />
                                </button>
                                <button className="icon-action danger" onClick={() => onDelete && onDelete(notice.id)} title="Delete">
                                    <Trash size={18} />
                                </button>
                            </>
                        )}

                        <button className="icon-action" onClick={handleShare} title="Share">
                            <ShareNetwork size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {currentImageIndex !== null && (
                <div
                    className="lightbox-overlay"
                    onClick={() => setCurrentImageIndex(null)}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <img src={displayImages[currentImageIndex].url} alt={`View ${currentImageIndex + 1}`} />

                        <button className="lightbox-close" onClick={() => setCurrentImageIndex(null)}>
                            <X size={24} weight="bold" />
                        </button>

                        {displayImages.length > 1 && (
                            <>
                                <button className="lightbox-nav prev" onClick={handlePrev}>
                                    <CaretLeft size={32} weight="bold" />
                                </button>
                                <button className="lightbox-nav next" onClick={handleNext}>
                                    <CaretRight size={32} weight="bold" />
                                </button>
                                <div className="lightbox-counter">
                                    {currentImageIndex + 1} / {displayImages.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default NoticeCard;
