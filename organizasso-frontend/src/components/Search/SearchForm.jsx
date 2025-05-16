import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Spinner from '../Common/Spinner';
// Import Form components
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// Import Date Picker components
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

// Define Zod schema for the search form
const searchFormSchema = z.object({
  keywords: z.string().max(100).optional(), // Optional keyword search
  author: z.string().max(50).optional(), // Optional author search
  startDate: z.date().optional(),
  endDate: z.date().optional(),
}).refine(data => {
    // Ensure endDate is not before startDate if both are provided
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      return false;
    }
    return true;
  }, {
    message: "End date cannot be before start date",
    path: ["endDate"], // Attach error to endDate field
});

const SearchForm = ({ onSearch, isLoading }) => { 
  const form = useForm({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      keywords: '',
      author: '',
      startDate: undefined, // Use undefined for optional dates
      endDate: undefined,
    },
  });

  const handleSubmit = (values) => {
    // Format dates to YYYY-MM-DD string for the API call if they exist
    const formattedValues = {
      ...values,
      startDate: values.startDate ? format(values.startDate, 'yyyy-MM-dd') : undefined,
      endDate: values.endDate ? format(values.endDate, 'yyyy-MM-dd') : undefined,
    };
    
    if (isLoading) return;
    console.log("SearchForm submitted:", formattedValues);
    onSearch(formattedValues);
  };

  // --- Inline Styles ---
  const titleStyle = { fontSize: '1.125rem' }; // text-lg
  // NOTE: Grid layout (grid, sm:grid-cols-2, lg:grid-cols-4, lg:col-span-1) is LOST.
  const contentStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' }; // Fallback layout
  const formItemColStyle = { display: 'flex', flexDirection: 'column' }; // flex flex-col
  const dateButtonStyle = {
      width: '100%',
      justifyContent: 'flex-start',
      textAlign: 'left',
      fontWeight: 'normal',
      // Conditional text color lost
  };
  const calendarIconStyle = { marginRight: '0.5rem', height: '1rem', width: '1rem' }; // mr-2 h-4 w-4
  const popoverContentStyle = { width: 'auto', padding: 0 }; // w-auto p-0
  const submitButtonStyle = { marginLeft: 'auto' }; // ml-auto
  const spinnerStyle = { marginRight: '0.5rem' }; // mr-2
  // --- End Inline Styles ---

  return (
    <Card>
      <CardHeader>
        <CardTitle style={titleStyle}>Search Criteria</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent style={contentStyle}>
            {/* Keywords */}
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem> {/* Grid span lost */}
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Input placeholder="Search content..." {...field} disabled={isLoading}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Author */}
             <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem> {/* Grid span lost */}
                  <FormLabel>Author Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Filter by author..." {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Range */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                 <FormItem style={formItemColStyle}> {/* Grid span lost */}
                   <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            style={dateButtonStyle} // Apply style
                            disabled={isLoading}
                          >
                            <CalendarIcon style={calendarIconStyle} />
                            {field.value ? format(field.value, "PPP") : <span>Pick a start date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent style={popoverContentStyle} align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                           disabled={(date) =>
                             form.getValues("endDate") ? date > form.getValues("endDate") : false
                           }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                   <FormMessage />
                 </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem style={formItemColStyle}> {/* Grid span lost */}
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          style={dateButtonStyle} // Apply style
                          disabled={isLoading}
                        >
                          <CalendarIcon style={calendarIconStyle} />
                          {field.value ? format(field.value, "PPP") : <span>Pick an end date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent style={popoverContentStyle} align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          form.getValues("startDate") ? date < form.getValues("startDate") : false
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} style={submitButtonStyle}>
              {isLoading ? <Spinner size="sm" style={spinnerStyle}/> : null}
              Search
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SearchForm;
