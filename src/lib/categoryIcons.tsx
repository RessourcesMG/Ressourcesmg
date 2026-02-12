import {
  Stethoscope, Wind, Heart, Smile, ScanFace, Activity, User, Baby, Droplet, Bug,
  Search, Briefcase, Accessibility, Brain, Apple, Ribbon, Eye, Ear, Bone, Pill,
  BrainCircuit, Scan, Hand, FileText, HeartHandshake, Sparkles, MoreHorizontal, Circle,
  Syringe, Thermometer, Bandage, Microscope, Beaker, FlaskConical, Leaf,
  Dumbbell, Moon, Sun, Zap, BookOpen, GraduationCap, Shield, Wrench,
} from 'lucide-react';
import { ThyroidIcon, UterusIcon, ToothIcon, TestTubeIcon, PregnantWomanIcon } from '@/components/icons/MedicalIcons';

export const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  Stethoscope, Wind, Heart, Smile, ScanFace, Activity, User, Baby, Droplet, Bug,
  Search, Briefcase, Accessibility, Brain, Apple, Ribbon, Eye, Ear, Bone, Pill,
  BrainCircuit, Scan, Hand, FileText, HeartHandshake, Sparkles, MoreHorizontal, Circle,
  Syringe, Thermometer, Bandage, Microscope, Beaker, FlaskConical, Leaf,
  Dumbbell, Moon, Sun, Zap, BookOpen, GraduationCap, Shield, Wrench,
  ThyroidIcon, UterusIcon, ToothIcon, TestTubeIcon, PregnantWomanIcon,
};

export const AVAILABLE_ICONS = Object.keys(iconComponents);
