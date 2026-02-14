"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Download, Share2, AlertCircle, Info, Calendar, Megaphone, Coffee, Search, X, Plus, Minus, Maximize2, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useNotification } from "@/contexts/notification-context";

interface Announcement {
    id: string;
    title: string;
    content: string;
    category: 'General' | 'Exam' | 'CES' | 'Event' | 'Holiday';
    priority: 'Normal' | 'High' | 'Urgent';
    image_data?: string;
    created_at: string;
    author_name: string;
    is_read?: boolean;
}

// Expandable text component for long content
const ExpandableText = ({ text }: { text: string }) => {
    const [expanded, setExpanded] = useState(false);
    const limit = 200;
    const isLong = text.length > limit;

    const displayText = expanded || !isLong ? text : text.slice(0, limit) + '...';

    return (
        <div className="flex flex-col items-start w-full relative group">
            <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap transition-all duration-300 relative">
                {displayText}
                {!expanded && isLong && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-950 to-transparent pointer-events-none" />
                )}
            </div>

            {isLong && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(!expanded);
                    }}
                    className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-sm px-1 -ml-1"
                >
                    {expanded ? (
                        <>
                            Show Less
                            <ChevronUp className="w-3.5 h-3.5" />
                        </>
                    ) : (
                        <>
                            Read More
                            <ChevronDown className="w-3.5 h-3.5" />
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);
    const { markAsRead } = useNotification();

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('/api/announcements');
            const data = await res.json();
            if (Array.isArray(data)) {
                setAnnouncements(data);
            }
        } catch (error) {
            console.error("Failed to load announcements", error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Exam': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'CES': return <Megaphone className="w-4 h-4 text-blue-500" />;
            case 'Event': return <Calendar className="w-4 h-4 text-purple-500" />;
            case 'Holiday': return <Coffee className="w-4 h-4 text-green-500" />;
            default: return <Info className="w-4 h-4 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
    };

    const handleShare = async (announcement: Announcement) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: announcement.title,
                    text: announcement.content,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            const text = `*${announcement.title}*\n${announcement.content}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    const handleDownload = (imageData: string, title: string) => {
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `${title.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCloseModal = () => {
        setSelectedAnnouncement(null);
        setIsImageFullscreen(false);
    };

    if (loading) {
        return <div className="p-4 text-center">Loading announcements...</div>;
    }

    return (
        <div className="space-y-4 max-w-2xl mx-auto pb-20 px-4">
            <h1 className="text-2xl font-bold mb-4">Announcements</h1>

            {announcements.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                    <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No announcements yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {announcements.map((item) => (
                        <Card
                            key={item.id}
                            onClick={() => {
                                setSelectedAnnouncement(item);
                                if (!item.is_read) {
                                    markAsRead(item.id);
                                    setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, is_read: true } : a));
                                }
                            }}
                            className="cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-800 overflow-hidden border-l-4 border-l-blue-500"
                        >
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            {getCategoryIcon(item.category)}
                                            {item.category}
                                        </Badge>
                                        <Badge className={getPriorityColor(item.priority)} variant="secondary">
                                            {item.priority}
                                        </Badge>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {format(new Date(item.created_at), 'MMM d')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-start mt-2 gap-2">
                                    <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                                    {!item.is_read && (
                                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                                            New
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {item.image_data && (
                                    <div className="w-full h-48 bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden mb-3">
                                        <img
                                            src={item.image_data}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {item.content}
                                </p>
                                <button
                                    className="mt-2 text-blue-600 text-sm font-medium hover:underline focus:outline-none"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedAnnouncement(item);
                                        if (!item.is_read) {
                                            markAsRead(item.id);
                                            setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, is_read: true } : a));
                                        }
                                    }}
                                >
                                    Read More
                                </button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )
            }

            {/* Detail Modal */}
            <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && handleCloseModal()}>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    {selectedAnnouncement && (
                        <>
                            <DialogHeader className="p-6 pb-2 border-b">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        {getCategoryIcon(selectedAnnouncement.category)}
                                        {selectedAnnouncement.category}
                                    </Badge>
                                    <Badge className={getPriorityColor(selectedAnnouncement.priority)} variant="secondary">
                                        {selectedAnnouncement.priority}
                                    </Badge>
                                    <span className="text-xs text-gray-500 ml-auto">
                                        {format(new Date(selectedAnnouncement.created_at), 'MMM d, yyyy h:mm a')}
                                    </span>
                                </div>
                                <DialogTitle className="text-2xl">{selectedAnnouncement.title}</DialogTitle>
                                <DialogDescription>
                                    Posted by {selectedAnnouncement.author_name}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-6 pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {selectedAnnouncement.image_data && (
                                    <div className="relative rounded-lg overflow-hidden border bg-gray-100 dark:bg-gray-900 mb-6 group">
                                        <img
                                            src={selectedAnnouncement.image_data}
                                            alt={selectedAnnouncement.title}
                                            className="w-full h-auto max-h-[400px] object-contain mx-auto"
                                        />
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <button
                                                onClick={() => setIsImageFullscreen(true)}
                                                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                                            >
                                                <Maximize2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(selectedAnnouncement.image_data!, selectedAnnouncement.title)}
                                                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <ExpandableText text={selectedAnnouncement.content} />
                            </div>

                            <div className="p-4 border-t bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                                <button
                                    onClick={() => handleShare(selectedAnnouncement)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Share Announcement
                                </button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Fullscreen Image Modal */}
            <Dialog open={isImageFullscreen} onOpenChange={setIsImageFullscreen}>
                <DialogContent className="max-w-[100vw] max-h-[100vh] h-screen w-screen bg-black/95 border-none p-0 flex flex-col items-center justify-center outline-none">
                    <DialogTitle className="sr-only">Fullscreen Image</DialogTitle>
                    <TransformWrapper
                        initialScale={1}
                        minScale={0.5}
                        maxScale={4}
                        centerOnInit
                    >
                        {({ zoomIn, zoomOut, resetTransform }) => (
                            <>
                                <div className="absolute top-4 right-4 z-50 flex gap-2">
                                    <button
                                        onClick={() => zoomOut()}
                                        className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                                    >
                                        <Minus className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => zoomIn()}
                                        className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                                    >
                                        <Plus className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            resetTransform();
                                            setIsImageFullscreen(false);
                                        }}
                                        className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="w-full h-full flex items-center justify-center">
                                    <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                                        <img
                                            src={selectedAnnouncement?.image_data}
                                            alt="Fullscreen"
                                            className="max-w-full max-h-screen object-contain"
                                        />
                                    </TransformComponent>
                                </div>
                            </>
                        )}
                    </TransformWrapper>
                </DialogContent>
            </Dialog>
        </div >
    );
}
