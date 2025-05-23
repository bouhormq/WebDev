import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from '../Common/Spinner';
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Search as SearchIcon } from 'lucide-react';
import { format } from 'date-fns';
import styles from './styles/SearchForm.module.css'; // Import CSS module

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

  return (
    <div className={styles.searchFormContainer}>
      <div className={styles.title}>Search Criteria</div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className={styles.form}>
          <div className={styles.content}>
            {/* Keywords */}
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem className={styles.formItemFullWidth}>
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Input className={styles.inputField} placeholder="Search content..." {...field} disabled={isLoading}/>
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
                <FormItem className={styles.formItemFullWidth}>
                  <FormLabel>Author Username</FormLabel>
                  <FormControl>
                    <Input className={styles.inputField} placeholder="Filter by author..." {...field} disabled={isLoading} />
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
                 <FormItem className={styles.formItemCol}>
                   <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={styles.dateButton}
                            disabled={isLoading}
                          >
                            <CalendarIcon className={styles.calendarIcon} />
                            {field.value ? format(field.value, "PPP") : <span className={styles.datePlaceholder}>Pick a start date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className={styles.popoverContent} align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          className={styles.calendarPopup}
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
                <FormItem className={styles.formItemCol}>
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={styles.dateButton}
                          disabled={isLoading}
                        >
                          <CalendarIcon className={styles.calendarIcon} />
                          {field.value ? format(field.value, "PPP") : <span className={styles.datePlaceholder}>Pick an end date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className={styles.popoverContent} align="start">
                      <Calendar
                        mode="single"
                        className={styles.calendarPopup}
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
          </div>
          <div className={styles.submitButtonContainer}>
            <Button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading ? <Spinner size="sm" className={styles.spinner}/> : <SearchIcon className={styles.submitButtonIcon} />}
              Search
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SearchForm;
