
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { defaultQuestions } from '@/utils/questions';
import { Plus, ArrowLeft, ArrowRight, Edit } from 'lucide-react';

interface QuestionFormProps {
  onSubmit: (answers: { question: string; answer: string }[]) => void;
  creatorName: string;
}

const QuestionForm = ({ onSubmit, creatorName }: QuestionFormProps) => {
  const [selectedQuestions, setSelectedQuestions] = useState(defaultQuestions.slice(0, 10));
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(''));
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [customQuestions, setCustomQuestions] = useState<{id: number; text: string; custom: boolean}[]>([]);
  const [showingCustomForm, setShowingCustomForm] = useState(false);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleQuestionChange = (index: number, questionId: number) => {
    const newSelectedQuestions = [...selectedQuestions];
    const newQuestion = defaultQuestions.find(q => q.id === questionId) || 
                        customQuestions.find(q => q.id === questionId);
    if (newQuestion) {
      newSelectedQuestions[index] = newQuestion;
      setSelectedQuestions(newSelectedQuestions);
    }
  };

  const addCustomQuestion = () => {
    if (customQuestion.trim() && customAnswer.trim()) {
      const newCustomQuestion = {
        id: Date.now(),
        text: customQuestion,
        custom: true
      };
      
      setCustomQuestions([...customQuestions, newCustomQuestion]);
      
      // Find an empty slot or replace a default question
      let questionAdded = false;
      const newSelectedQuestions = [...selectedQuestions];
      const newAnswers = [...answers];
      
      // Try to find a slot with an empty answer
      for (let i = 0; i < newSelectedQuestions.length; i++) {
        if (!newAnswers[i] || newAnswers[i].trim() === '') {
          newSelectedQuestions[i] = newCustomQuestion;
          newAnswers[i] = customAnswer;
          questionAdded = true;
          break;
        }
      }
      
      // If no empty slot, replace the last question
      if (!questionAdded) {
        if (newSelectedQuestions.length < 10) {
          newSelectedQuestions.push(newCustomQuestion);
          newAnswers.push(customAnswer);
        } else {
          newSelectedQuestions[9] = newCustomQuestion;
          newAnswers[9] = customAnswer;
        }
      }
      
      setSelectedQuestions(newSelectedQuestions);
      setAnswers(newAnswers);
      
      // Reset the form
      setCustomQuestion('');
      setCustomAnswer('');
      setShowingCustomForm(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedAnswers = selectedQuestions.map((question, index) => ({
      question: question.text.replace('[NAME]', creatorName),
      answer: answers[index]
    }));
    onSubmit(formattedAnswers);
  };

  const isCurrentStepValid = () => {
    if (currentStep < 5) {
      return answers.slice(currentStep * 2, (currentStep + 1) * 2).every(a => a.trim());
    }
    return true;
  };

  const handleRemoveCustomQuestion = (id: number) => {
    // Remove from customQuestions list
    setCustomQuestions(customQuestions.filter(q => q.id !== id));
    
    // Find and replace in selectedQuestions with a default question
    const index = selectedQuestions.findIndex(q => q.id === id);
    if (index !== -1) {
      const newSelectedQuestions = [...selectedQuestions];
      const replacementQuestion = defaultQuestions.find(q => !selectedQuestions.some(sq => sq.id === q.id));
      
      if (replacementQuestion) {
        newSelectedQuestions[index] = replacementQuestion;
      } else {
        newSelectedQuestions[index] = defaultQuestions[0]; // Fallback
      }
      
      setSelectedQuestions(newSelectedQuestions);
      
      // Clear the answer for this question
      const newAnswers = [...answers];
      newAnswers[index] = '';
      setAnswers(newAnswers);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      {currentStep < 5 ? (
        <div className="space-y-6">
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-2xl font-semibold">Tell us about yourself</h2>
            <p className="text-muted-foreground">
              Answer these questions so your partner can test how well they know you.
            </p>
            <div className="flex justify-center space-x-1 mt-4">
              {[0, 1, 2, 3, 4].map(step => (
                <div 
                  key={step}
                  className={`h-1.5 w-6 rounded-full ${
                    step === currentStep ? 'bg-primary' : 
                    step < currentStep ? 'bg-primary/50' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            {selectedQuestions.slice(currentStep * 2, (currentStep + 1) * 2).map((question, localIndex) => {
              const globalIndex = currentStep * 2 + localIndex;
              return (
                <Card key={globalIndex} className="p-4 transition-all duration-300 hover:shadow-md">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-medium">
                        {question.text.replace('[NAME]', creatorName)}
                      </Label>
                      
                      <select 
                        className="text-xs bg-secondary px-2 py-1 rounded focus-ring"
                        onChange={(e) => handleQuestionChange(globalIndex, Number(e.target.value))}
                        value={question.id}
                      >
                        {defaultQuestions.map(q => (
                          <option key={q.id} value={q.id}>
                            {q.text.substring(0, 20)}...
                          </option>
                        ))}
                        {customQuestions.map(q => (
                          <option key={q.id} value={q.id}>
                            {q.text.substring(0, 20)}... (Custom)
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <Input
                      placeholder="Your answer"
                      value={answers[globalIndex] || ''}
                      onChange={(e) => handleAnswerChange(globalIndex, e.target.value)}
                      className="w-full"
                    />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Custom Question Form - Inline on the current question page */}
          {showingCustomForm ? (
            <Card className="p-4 mt-6 border-dashed border-2 border-primary/30 bg-primary/5">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center">
                  <Plus className="mr-2" size={16} />
                  Add a Custom Question
                </h3>
                
                <div>
                  <Label htmlFor="inlineCustomQuestion">Your Question</Label>
                  <Input
                    id="inlineCustomQuestion"
                    placeholder="e.g., What was our first date spot?"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="inlineCustomAnswer">The Answer</Label>
                  <Input
                    id="inlineCustomAnswer"
                    placeholder="e.g., Central Park"
                    value={customAnswer}
                    onChange={(e) => setCustomAnswer(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    onClick={addCustomQuestion}
                    disabled={!customQuestion.trim() || !customAnswer.trim()}
                    className="flex-1"
                  >
                    Add Question
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowingCustomForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowingCustomForm(true)}
              className="w-full mt-4 border-dashed"
            >
              <Plus className="mr-2" size={16} />
              Add Custom Question
            </Button>
          )}
          
          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="transition-all"
              >
                <ArrowLeft className="mr-1" size={16} />
                Previous
              </Button>
            )}
            {currentStep < 4 ? (
              <Button 
                type="button" 
                onClick={() => setCurrentStep(currentStep + 1)}
                className="ml-auto transition-all"
                disabled={!isCurrentStepValid()}
              >
                Next
                <ArrowRight className="ml-1" size={16} />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="ml-auto transition-all"
                disabled={!isCurrentStepValid()}
              >
                Review All Questions
                <ArrowRight className="ml-1" size={16} />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold">Review Your Questions</h2>
            <p className="text-muted-foreground">
              Make sure everything is correct before generating your puzzle.
            </p>
          </div>
          
          <div className="space-y-4">
            {selectedQuestions.map((question, index) => (
              <Card key={index} className="p-4 flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium">{question.text.replace('[NAME]', creatorName)}</p>
                  <p className="text-primary mt-1">{answers[index]}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCurrentStep(Math.floor(index / 2))}
                  className="ml-2"
                >
                  <Edit size={16} />
                </Button>
              </Card>
            ))}
          </div>
          
          <Card className="p-6 mt-6">
            <div className="space-y-4">
              <h3 className="font-medium">Add One More Custom Question</h3>
              <div>
                <Label htmlFor="finalCustomQuestion">Your Question</Label>
                <Input
                  id="finalCustomQuestion"
                  placeholder="e.g., What was our first date spot?"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="finalCustomAnswer">The Answer</Label>
                <Input
                  id="finalCustomAnswer"
                  placeholder="e.g., Central Park"
                  value={customAnswer}
                  onChange={(e) => setCustomAnswer(e.target.value)}
                />
              </div>
              
              <Button 
                type="button" 
                onClick={addCustomQuestion}
                disabled={!customQuestion.trim() || !customAnswer.trim()}
                className="w-full"
              >
                <Plus className="mr-1" size={16} />
                Add Question
              </Button>
            </div>
            
            {customQuestions.length > 0 && (
              <div className="mt-6">
                <Separator className="my-4" />
                <h3 className="font-medium mb-3">Your Custom Questions:</h3>
                <ul className="space-y-2">
                  {customQuestions.map((q) => (
                    <li key={q.id} className="flex justify-between items-center text-sm p-2 rounded bg-secondary/40">
                      <span className="font-medium">{q.text}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveCustomQuestion(q.id)}
                        className="h-8 text-destructive hover:text-destructive/90"
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
          
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setCurrentStep(4)}
              className="transition-all"
            >
              <ArrowLeft className="mr-1" size={16} />
              Back
            </Button>
            <Button 
              type="submit"
              className="transition-all"
            >
              Generate Puzzle
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};

export default QuestionForm;
