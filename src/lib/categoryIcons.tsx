import {
  Stethoscope, Wind, Heart, Smile, ScanFace, Activity, User, Baby, Droplet, Bug,
  Search, Briefcase, Accessibility, Brain, Apple, Ribbon, Eye, Ear, Bone, Pill,
  BrainCircuit, Scan, Hand, FileText, HeartHandshake, Sparkles, MoreHorizontal, Circle,
  Syringe, Thermometer, Bandage, Microscope, Beaker, FlaskConical, Leaf,
  Dumbbell, Moon, Sun, Zap, BookOpen, GraduationCap, Shield, Wrench,
  Ambulance, Hospital, Cross, Dna, Scale, HeartPulse, BedDouble, Cigarette,
  PillBottle, ScanHeart, ScanEye, ActivitySquare, TestTubes, FlaskRound, Droplets, Weight,
  Home, Building2, Mail, Phone, Calendar, Clock, Star, Book, Settings,
  Camera, Image, Video, Music, Palette, Pen, Pencil, Scissors,
  Globe, MapPin, Map, Compass, Plane, Car, Bike, Footprints,
  Gift, Award, Medal, Trophy, Target, Crosshair,
  BarChart, PieChart, LineChart, TrendingUp, Calculator,
  Coffee, UtensilsCrossed, Wine, IceCream, Cookie,
  Flower2, TreePine, Mountain, Waves, Fish, Bird,
  Bot, Cpu, Wifi, Smartphone, Monitor, Laptop, Tablet,
  AlertCircle, HelpCircle, Info, CheckCircle, XCircle,
  Folder, Archive, Inbox, Package, Box,
  BriefcaseMedical,
} from 'lucide-react';
import { ThyroidIcon, UterusIcon, ToothIcon, TestTubeIcon, PregnantWomanIcon } from '@/components/icons/MedicalIcons';

export const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  Stethoscope, Wind, Heart, Smile, ScanFace, Activity, User, Baby, Droplet, Bug,
  Search, Briefcase, Accessibility, Brain, Apple, Ribbon, Eye, Ear, Bone, Pill,
  BrainCircuit, Scan, Hand, FileText, HeartHandshake, Sparkles, MoreHorizontal, Circle,
  Syringe, Thermometer, Bandage, Microscope, Beaker, FlaskConical, Leaf,
  Dumbbell, Moon, Sun, Zap, BookOpen, GraduationCap, Shield, Wrench,
  Ambulance, Hospital, Cross, Dna, Scale, HeartPulse, BedDouble, Cigarette,
  PillBottle, ScanHeart, ScanEye, ActivitySquare, TestTubes, FlaskRound, Droplets, Weight,
  Home, Building2, Mail, Phone, Calendar, Clock, Star, Book, Settings,
  Camera, Image, Video, Music, Palette, Pen, Pencil, Scissors,
  Globe, MapPin, Map, Compass, Plane, Car, Bike, Footprints,
  Gift, Award, Medal, Trophy, Target, Crosshair,
  BarChart, PieChart, LineChart, TrendingUp, Calculator,
  Coffee, UtensilsCrossed, Wine, IceCream, Cookie,
  Flower2, TreePine, Mountain, Waves, Fish, Bird,
  Bot, Cpu, Wifi, Smartphone, Monitor, Laptop, Tablet,
  AlertCircle, HelpCircle, Info, CheckCircle, XCircle,
  Folder, Archive, Inbox, Package, Box,
  BriefcaseMedical,
  ThyroidIcon, UterusIcon, ToothIcon, TestTubeIcon, PregnantWomanIcon,
};

/** Icônes à usage médical (affichées en premier dans le sélecteur) */
export const MEDICAL_ICONS = [
  'Stethoscope', 'Heart', 'HeartPulse', 'Brain', 'BrainCircuit', 'Eye', 'Ear', 'Bone', 'Pill', 'PillBottle',
  'Syringe', 'Thermometer', 'Bandage', 'Microscope', 'Beaker', 'FlaskConical', 'FlaskRound', 'TestTubes',
  'Ambulance', 'Hospital', 'Cross', 'Dna', 'BriefcaseMedical', 'Scale', 'Weight', 'BedDouble', 'Cigarette',
  'Scan', 'ScanFace', 'ScanHeart', 'ScanEye', 'Activity', 'ActivitySquare', 'Droplet', 'Droplets',
  'Accessibility', 'Baby', 'User', 'ThyroidIcon', 'UterusIcon', 'ToothIcon', 'TestTubeIcon', 'PregnantWomanIcon',
];

export const AVAILABLE_ICONS = Object.keys(iconComponents);
