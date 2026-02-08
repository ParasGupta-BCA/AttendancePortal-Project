"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Download, Share2, AlertCircle, Info, Calendar, Megaphone, Coffee, Search, X, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

interface Announcement {
    id: string;
    title: string;
    content: string;
    category: 'General' | 'Exam' | 'CES' | 'Event' | 'Holiday';
    priority: 'Normal' | 'High' | 'Urgent';
    image_data?: string;
    created_at: string;
    author_name: string;
}

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<{ src: string, alt: string } | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [zoomLevel, setZoomLevel] = useState(1);

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

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const openImageModal = (src: string, alt: string) => {
        setSelectedImage({ src, alt });
        setZoomLevel(1);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
        setZoomLevel(1);
    };

    const handleZoomIn = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setZoomLevel(prev => Math.min(prev + 0.5, 3));
    };

    const handleZoomOut = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setZoomLevel(prev => Math.max(prev - 0.5, 1));
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

    if (loading) {
        return <div className="p-4 text-center">Loading announcements...</div>;
    }

    return (
        <div className="space-y-4 max-w-2xl mx-auto pb-20">
            <h1 className="text-2xl font-bold mb-4">Announcements</h1>

            {announcements.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                    <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No announcements yet.</p>
                </div>
            ) : (
                announcements.map((item) => (
                    <Card key={item.id} className="overflow-hidden border-l-4 border-l-blue-500 dark:bg-gray-800">
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
                                    {format(new Date(item.created_at), 'MMM d, h:mm a')}
                                </span>
                            </div>
                            <CardTitle className="text-lg mt-2">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                                {item.content}
                            </p>

                            {item.image_data && (
                                <div className="relative rounded-lg overflow-hidden border bg-gray-100 dark:bg-gray-900 mt-2">
                                    {/* Using standard img for base64 if Image component fails or for simplicity with base64 */}
                                    <img
                                        src={item.image_data}
                                        alt={item.title}
                                        className="w-full h-auto max-h-[400px] object-contain"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button
                                            onClick={() => handleDownload(item.image_data!, item.title)}
                                            className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                                            title="Download Image"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-2 border-t mt-2">
                                <span className="text-xs text-gray-500">Posted by {item.author_name}</span>
                                <button
                                    onClick={() => handleShare(item)}
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}
