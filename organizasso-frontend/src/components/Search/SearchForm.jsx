import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { CalendarIcon, Search as SearchIcon } from 'lucide-react';
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
  const titleStyle = { fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' };
  const contentStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' };
  const formItemColStyle = { display: 'flex', flexDirection: 'column' };
  const dateButtonStyle = {
      width: '100%',
      justifyContent: 'flex-start',
      textAlign: 'left',
      fontWeight: 'normal',
  };
  const calendarIconStyle = { marginRight: '0.5rem', height: '1rem', width: '1rem' };
  const popoverContentStyle = { width: 'auto', padding: 0 };
  const iconStyle = { height: '1rem', width: '1rem', marginRight: '0.5rem' };
  const submitButtonStyle = {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 'var(--radius)',
  };
  const spinnerStyle = { marginRight: '0.5rem' };
  // --- End Inline Styles ---

  return (
    <div style={{width: '100%'}}>
      <div style={titleStyle}>Search Criteria</div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} style={{ width: '100%', boxSizing: 'border-box' }}>
          <div style={{ ...contentStyle, width: '100%' }}>
            {/* Keywords */}
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem style={{ width: '100%' }}>
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Input style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#FDFBF9', border: '1px solid #D3C1B1' }} placeholder="Search content..." {...field} disabled={isLoading}/>
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
                <FormItem style={{ width: '100%' }}>
                  <FormLabel>Author Username</FormLabel>
                  <FormControl>
                    <Input style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#FDFBF9', border: '1px solid #D3C1B1'  }} placeholder="Filter by author..." {...field} disabled={isLoading} />
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
                 <FormItem style={{ ...formItemColStyle, width: '100%' }}>
                   <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            style={{ ...dateButtonStyle, width: '100%', backgroundColor: '#FDFBF9', border: '1px solid #D3C1B1'  }}
                            disabled={isLoading}
                          >
                            <CalendarIcon style={calendarIconStyle} />
                            {field.value ? format(field.value, "PPP") : <span style={{color:'grey'}}>Pick a start date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent style={popoverContentStyle} align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          style={{backgroundColor: '#FDFBF9', border: '1px solid #D3C1B1' }}
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
                <FormItem style={{ ...formItemColStyle, width: '100%',  }}>
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          style={{ ...dateButtonStyle, width: '100%', backgroundColor: '#FDFBF9', border: '1px solid #D3C1B1'  }}
                          disabled={isLoading}
                        >
                          <CalendarIcon style={calendarIconStyle} />
                          {field.value ? format(field.value, "PPP") : <span style={{color:'grey'}}>Pick an end date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent style={popoverContentStyle} align="start">
                      <Calendar
                        mode="single"
                        style={{backgroundColor: '#FDFBF9', border: '1px solid #D3C1B1' }}
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Button type="submit" disabled={isLoading} style={{ ...submitButtonStyle, ...submitButtonStyle }}>
              {isLoading ? <Spinner size="sm" style={spinnerStyle}/> : <SearchIcon style={iconStyle} />}
              Search
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SearchForm;
