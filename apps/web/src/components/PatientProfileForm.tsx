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

  useEffect(() => {
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
  }, [reset]);

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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Medical Profile</CardTitle>
        <CardDescription>
          Update your medical history, conditions, and genomic data to help our AI find the best clinical trials for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" placeholder="e.g. 45" {...register("age")} />
            {errors.age && <p className="text-sm text-red-500">{errors.age.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="conditions">Medical Conditions</Label>
            <Input id="conditions" placeholder="e.g. Type 2 Diabetes, Hypertension (comma separated)" {...register("conditions")} />
            <p className="text-sm text-muted-foreground">List any known medical conditions.</p>
            {errors.conditions && <p className="text-sm text-red-500">{errors.conditions.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="genes">Genomic Markers</Label>
            <Input id="genes" placeholder="e.g. BRCA1, EGFR (comma separated)" {...register("genes")} />
            <p className="text-sm text-muted-foreground">If you have had genetic testing, list relevant markers.</p>
            {errors.genes && <p className="text-sm text-red-500">{errors.genes.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="medical_history">Brief Medical History</Label>
            <Textarea 
              id="medical_history"
              placeholder="Summarize your past treatments, surgeries, or other relevant health information..." 
              className="min-h-[120px]"
              {...register("medical_history")} 
            />
            {errors.medical_history && <p className="text-sm text-red-500">{errors.medical_history.message}</p>}
          </div>
          
          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
