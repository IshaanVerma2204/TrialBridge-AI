"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { patientApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";

const profileSchema = z.object({
  age: z.string().min(1, "Age is required"),
  medical_history: z.string().optional(),
  conditions: z.string().optional(),
  genes: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function PatientProfileForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: "",
      medical_history: "",
      conditions: "",
      genes: "",
    },
  });

  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== "patient") {
      // eslint-disable-next-line
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await patientApi.getProfile();
        if (data && !data.detail) {
          reset({
            age: data.age || "",
            medical_history: data.medical_history || "",
            conditions: data.conditions || "",
            genes: data.genes || "",
          });
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [reset, user]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      await patientApi.updateProfile(data);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading profile...</div>;
  }

  return (
    <Card className="w-full mx-auto border-0 shadow-none bg-transparent">
      <CardHeader className="px-8 pt-8 pb-4">
        <CardTitle className="text-2xl font-extrabold text-slate-900">Medical Profile</CardTitle>
        <CardDescription className="text-slate-500 font-medium">
          Update your medical history, conditions, and genomic data to help our AI find the best clinical trials for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="age" className="font-semibold text-slate-700">Age</Label>
              <Input id="age" type="number" placeholder="e.g. 45" className="bg-slate-50/50 border-slate-200 focus:bg-white transition-colors rounded-xl h-12" {...register("age")} />
              {errors.age && <p className="text-sm text-red-500 font-medium">{errors.age.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="conditions" className="font-semibold text-slate-700">Medical Conditions</Label>
              <Input id="conditions" placeholder="e.g. Type 2 Diabetes" className="bg-slate-50/50 border-slate-200 focus:bg-white transition-colors rounded-xl h-12" {...register("conditions")} />
              <p className="text-xs text-slate-400 font-medium">Comma separated list of conditions.</p>
              {errors.conditions && <p className="text-sm text-red-500 font-medium">{errors.conditions.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="genes" className="font-semibold text-slate-700">Genomic Markers (Optional)</Label>
            <Input id="genes" placeholder="e.g. BRCA1, EGFR" className="bg-slate-50/50 border-slate-200 focus:bg-white transition-colors rounded-xl h-12" {...register("genes")} />
            <p className="text-xs text-slate-400 font-medium">If you have had genetic testing, list relevant markers.</p>
            {errors.genes && <p className="text-sm text-red-500 font-medium">{errors.genes.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="medical_history" className="font-semibold text-slate-700">Brief Medical History</Label>
            <Textarea 
              id="medical_history"
              placeholder="Summarize your past treatments, surgeries, or other relevant health information..." 
              className="min-h-[140px] bg-slate-50/50 border-slate-200 focus:bg-white transition-colors rounded-xl resize-none p-4"
              {...register("medical_history")} 
            />
            {errors.medical_history && <p className="text-sm text-red-500 font-medium">{errors.medical_history.message}</p>}
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12 font-semibold shadow-lg shadow-blue-600/20 transition-transform hover:-translate-y-1">
              {isSaving ? "Saving..." : "Save Medical Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
