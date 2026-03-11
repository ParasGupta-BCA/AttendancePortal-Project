"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Trash2, Edit, Plus, Upload, X, Save, AlertCircle, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";

interface Announcement {
    id: string;
    title: string;
    content: string;
    category: string;
    priority: string;
    image_data?: string;
    event_date?: string;
    created_at: string;
    author_name: string;
}

interface AnnouncementManagementProps {
    apiBase?: string;
}

export function AnnouncementManagement({ apiBase = '/api' }: AnnouncementManagementProps) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("General");
    const [priority, setPriority] = useState("Normal");
    const [imageData, setImageData] = useState<string | null>(null);
    const [eventDate, setEventDate] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch(`${apiBase}/announcements`);
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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 500 * 1024) { // 500KB limit
            alert("File size exceeds 500KB limit.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImageData(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const resetForm = () => {
        setTitle("");
        setContent("");
        setCategory("General");
        setPriority("Normal");
        setImageData(null);
        setEventDate("");
        setEditingId(null);
    };

    const handleEdit = (item: Announcement) => {
        setEditingId(item.id);
        setTitle(item.title);
        setContent(item.content);
        setCategory(item.category);
        setPriority(item.priority);
        setImageData(item.image_data || null);
        setEventDate(item.event_date ? item.event_date.toString().split('T')[0] : "");
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const url = editingId ? `${apiBase}/announcements/${editingId}` : `${apiBase}/announcements`;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    category,
                    priority,
                    image_data: imageData,
                    event_date: eventDate || undefined
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `Failed to ${editingId ? 'update' : 'create'}`);
            }

            resetForm();
            setIsDialogOpen(false);
            fetchAnnouncements();
        } catch (error) {
            console.error(error);
            alert(`Failed to ${editingId ? 'update' : 'post'} announcement`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;

        try {
            await fetch(`${apiBase}/announcements/${id}`, { method: 'DELETE' });
            setAnnouncements(announcements.filter(a => a.id !== id));
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Announcements</h2>
                    <p className="text-muted-foreground">Manage announcements for students and faculty.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 w-4 h-4" /> New Announcement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
                            <DialogDescription>
                                {editingId ? 'Update the announcement details below.' : 'Post a new announcement visible to everyone.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="Enter title (e.g., Exam Schedule)"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="General">General</SelectItem>
                                            <SelectItem value="Exam">Exam</SelectItem>
                                            <SelectItem value="CES">CES</SelectItem>
                                            <SelectItem value="Event">Event</SelectItem>
                                            <SelectItem value="Holiday">Holiday</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select value={priority} onValueChange={setPriority}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Normal">Normal</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Write the details here..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="eventDate">
                                    <CalendarDays className="inline-block w-4 h-4 mr-1.5 -mt-0.5" />
                                    {category === 'CES' ? 'CES Date' : 'Event Date'} {category !== 'CES' && <span className="text-muted-foreground font-normal">(Optional)</span>}
                                </Label>
                                <Input
                                    id="eventDate"
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    required={category === 'CES'}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {eventDate ? 'Students will receive an automatic reminder email the day before this date.' : 'Set a date to auto-send a reminder the day before.'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Attachment (Image)</Label>
                                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imageData ? (
                                        <div className="relative">
                                            <img src={imageData} alt="Preview" className="max-h-40 mx-auto rounded" />
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setImageData(null);
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                            <Upload className="h-8 w-8 text-gray-400" />
                                            <span className="text-xs">Click to upload image (Max 500KB)</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={submitting}>
                                    {submitting
                                        ? (editingId ? 'Saving...' : 'Posting...')
                                        : (editingId ? 'Save Changes' : 'Post Announcement')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {announcements.map((item) => (
                    <Card key={item.id} className="relative group overflow-hidden">
                        {item.image_data && (
                            <div className="h-32 w-full bg-gray-100 relative">
                                <img src={item.image_data} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant={item.priority === 'Urgent' ? 'destructive' : 'secondary'}>
                                    {item.category}
                                </Badge>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-blue-500"
                                        onClick={() => handleEdit(item)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                            <CardDescription className="text-xs">
                                <span>
                                    {(() => { try { return format(new Date(item.created_at), 'MMM d, yyyy'); } catch { return String(item.created_at).split('T')[0]; } })()}
                                    {' \u2022 '}{item.author_name}
                                </span>
                                {item.event_date ? (
                                    <span className="block mt-1 text-blue-600 dark:text-blue-400 font-medium">
                                        <CalendarDays className="inline-block w-3 h-3 mr-1 -mt-0.5" />
                                        {(() => { try { return format(new Date(String(item.event_date).split('T')[0] + 'T00:00:00'), 'MMM d, yyyy'); } catch { return String(item.event_date).split('T')[0]; } })()}
                                    </span>
                                ) : null}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                {item.content}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
